import React, { useMemo } from "react"
import { useOrganizationProjectColumns, IIssueWithMetaData } from "./graphql/queries/getOrganizationProjectColumns"
import { Col, Row, Card, Popover, Button } from "antd"
import { flattenDeep, unionBy, uniq } from "lodash"
import { filterUndefined, filterNull, mapColumnToColor } from "./utils"
import styled from "styled-components"
import { useConfig } from "./config"
import { getIssueSize } from "./utils/issueSize"

const FlexCol = styled(Col)`
	width: auto !important;
	flex: 1 1 0px !important;
	flex-basis: 150px !important;
	flex-grow: 1 !important;
	margin: 0px 10px;
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

const OverallStoryPoints = styled.div`
	position: absolute;
	bottom: 20px;
	right: 20px;
`

interface IProjectProps {
	organization: string
	project: string
	columnNames: string[]
}

export const IssuesByAssignee: React.FC<IProjectProps> = ({ organization, project, columnNames }) => {
	const config = useConfig()
	const {
		behavior: { pollInterval },
	} = useConfig()

	const { data, loading, error } = useOrganizationProjectColumns(organization, parseInt(project), {
		pollInterval,
	})

	const { users, issuesByUsername } = useMemo<{
		users: string[]
		issuesByUsername: Map<string, IIssueWithMetaData[]>
	}>(() => {
		if (!data) return { users: [], issuesByUsername: new Map() }

		const users: string[] = uniq(
			flattenDeep(
				data.map((column) =>
					column.cards.nodes.map((card) =>
						card.content ? card.content.assignees.nodes.map((assignee) => assignee.login) : [],
					),
				),
			)
				.filter(filterNull)
				.filter(filterUndefined),
		)

		const columns = data.filter((column) => columnNames.includes(column.name))

		const columnIssues = flattenDeep(
			columns.map((column) =>
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
		const issuesByUsername: Map<string, IIssueWithMetaData[]> = new Map()
		columnIssues.forEach((issue) => {
			const usernames = issue.assignees.nodes.map((assignee) => assignee.login)

			usernames.forEach((username) => {
				if (!issuesByUsername.has(username)) {
					issuesByUsername.set(username, [])
				}

				issuesByUsername.get(username)!.push(issue)
			})
		})

		return { users, issuesByUsername }
	}, [data, columnNames, config.general.labelSizeMatcher])

	const uniqueIssues = useMemo(() => unionBy(Array.from(issuesByUsername.values()).flat(), "id"), [issuesByUsername])
	const overallStoryPoints = useMemo(() => uniqueIssues.reduce((sum, issue) => sum + (issue.storyPoints || 0), 0), [
		uniqueIssues,
	])
	const issuesWithoutStoryPoints = useMemo(() => uniqueIssues.filter((issue) => issue.storyPoints === null), [
		uniqueIssues,
	])

	if (error) return <p>{error.toString()}</p>
	if (loading) return <p>Loading...</p>

	return (
		<Container>
			<Row>
				{users.map((username) => (
					<FlexCol span={5} key={username}>
						<StickyCard
							title={<CardHeader username={username} issues={issuesByUsername.get(username) || []} />}
							bordered={false}
						>
							{(issuesByUsername.get(username) || []).map((issue) => (
								<p key={issue.id}>
									<a
										target="_blank"
										rel="noopener noreferrer"
										href={issue.url}
										style={{ color: mapColumnToColor(issue.columnName) }}
									>
										{`${issue.title}`}
									</a>
								</p>
							))}
						</StickyCard>
					</FlexCol>
				))}
			</Row>
			<OverallStoryPoints>
				<div>{`Overall Storypoints: ${overallStoryPoints}`}</div>
				<Popover
					title="Issues without storypoints"
					content={
						<>
							{issuesWithoutStoryPoints.map((issue) => (
								<div key={issue.id}>
									<a href={issue.url} target="_blank" rel="noopener noreferrer">
										{issue.title}
									</a>
								</div>
							))}
						</>
					}
				>
					<Button
						type="link"
						style={{ padding: 0 }}
					>{`${issuesWithoutStoryPoints.length} issues without storypoints`}</Button>
				</Popover>
			</OverallStoryPoints>
		</Container>
	)
}

interface ICardHeaderProps {
	username: string
	issues: IIssueWithMetaData[]
}

const CardHeader = ({ username, issues }: ICardHeaderProps) => {
	const storyPoints = useMemo(
		() => issues.reduce((sum, issue) => sum + (issue.storyPoints || 0) / issue.assignees.nodes.length, 0),
		[issues],
	)

	return (
		<div>
			<span>{username}</span>
			<span>{` [${storyPoints}]`}</span>
		</div>
	)
}
