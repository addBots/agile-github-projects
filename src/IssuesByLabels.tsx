import React, { useMemo } from "react"
import { useParams } from "react-router"
import { flattenDeep } from "lodash"
import { useOrganizationProjectColumns, IIssueWithMetaData } from "./graphql/queries/getOrganizationProjectColumns"
import { labelsFromProjectColumns, mapColumnToColor, filterNull } from "./utils"
import styled from "styled-components"
import { Row, Card, Col } from "antd"
import { useConfig } from "./config"
import { IProjectRoute } from "./types/RouteParams"
import { getIssueSize } from "./utils/issueSize"

const FlexCol = styled(Col)`
	width: auto !important;
	flex: 1 1 0px !important;
	flex-basis: 150px !important;
	flex-grow: 1 !important;
	margin: 0px 10px;
	min-width: 250px;
	margin-bottom: 20px;
`

const StickyCard = styled(Card)`
	& .ant-card-head {
		top: -20px;
		position: sticky;
		min-height: 32px;
		background-color: white;
	}

	& .ant-card-head-title {
		padding: 10px 0;
	}
`

const Container = styled.div`
	background: #ececec;
	padding: 20px 10px;
	overflow-y: auto;
`

interface IProjectProps {
	labelNames: string[]
}

export const IssuesByLabels: React.FC<IProjectProps> = ({ labelNames }) => {
	const { projectNumber } = useParams<IProjectRoute>()
	const config = useConfig()
	const {
		behavior: { pollInterval },
	} = useConfig()

	const { data, loading, error } = useOrganizationProjectColumns("addBots", parseInt(projectNumber!), {
		pollInterval,
	})

	const { labels, issuesByLabel } = useMemo<{
		labels: string[]
		issuesByLabel: Map<string, IIssueWithMetaData[]>
	}>(() => {
		if (!data) return { labels: [], issuesByLabel: new Map() }

		const allLabels = labelsFromProjectColumns(data)
		const labels = allLabels.filter((label) => labelNames.includes(label))
		const issues = flattenDeep(
			data.map((column) =>
				column.cards.nodes
					.map((card) => card.content)
					.filter(filterNull)
					.map(
						(issue): IIssueWithMetaData => ({
							...issue,
							columnName: column.name,
							storyPoints: getIssueSize(issue, config.general.labelSizeMatcher),
						}),
					),
			),
		)

		const issuesByLabel: Map<string, IIssueWithMetaData[]> = new Map()
		issues.forEach((issue) => {
			const issueLabels = issue.labels.nodes.map((label) => label.name)

			issueLabels.forEach((issueLabel) => {
				if (!issuesByLabel.has(issueLabel)) {
					issuesByLabel.set(issueLabel, [])
				}

				issuesByLabel.get(issueLabel)!.push(issue)
			})
		})

		return { labels, issuesByLabel }
	}, [data, labelNames, config.general.labelSizeMatcher])

	if (error) return <p>{error.toString()}</p>
	if (loading) return <p>Loading...</p>

	return (
		<Container>
			<Row>
				{labels.map((label) => (
					<FlexCol span={5} key={label}>
						<StickyCard title={label} bordered={false}>
							{(issuesByLabel.get(label) || []).map((issue) => (
								<p key={issue.id}>
									<a
										target="_blank"
										rel="noopener noreferrer"
										href={issue.url}
										style={{ color: mapColumnToColor(issue.columnName) }}
									>
										{issue.title}
									</a>
								</p>
							))}
						</StickyCard>
					</FlexCol>
				))}
			</Row>
		</Container>
	)
}
