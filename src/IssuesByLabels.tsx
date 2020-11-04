import React, { useMemo } from "react"
import { flattenDeep } from "lodash"
import { useOrganizationProjectColumns, IIssueWithMetaData } from "./graphql/queries/getOrganizationProjectColumns"
import { labelsFromProjectColumns, mapColumnToColor, filterNull } from "./utils"
import { useConfig } from "./config"
import { getIssueSize } from "./utils/issueSize"
import { FlexCol, StickyCard } from "./common/BoardComponents"

interface IProjectProps {
	organization: string
	project: string
	labelNames: string[]
}

export const IssuesByLabels: React.FC<IProjectProps> = ({ organization, project, labelNames }) => {
	const config = useConfig()
	const {
		behavior: { pollInterval },
	} = useConfig()

	const { data, loading, error } = useOrganizationProjectColumns(organization, parseInt(project), {
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
		<>
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
		</>
	)
}
