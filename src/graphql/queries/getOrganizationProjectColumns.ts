import { gql } from "apollo-boost"
import { useQuery, QueryHookOptions } from "@apollo/react-hooks"

export interface IConnection<T> {
	nodes: T[]
}

export interface IUser {
	id: string
	name: string
	login: string
}

export interface ILabel {
	id: string
	name: string
}

export interface IIssue {
	__typename: "Issue"
	id: string
	title: string
	url: string
	assignees: IConnection<IUser>
	labels: IConnection<ILabel>
}

export interface IIssueWithMetaData extends IIssue {
	columnName: string
	storyPoints: number | null
}

export interface IProjectCard {
	id: string
	note: string | null
	content: IIssue | null
}

export interface IProjectColumn {
	id: string
	name: string
	cards: IConnection<IProjectCard>
}

export interface IGetOrganizationProjectItemsData {
	organization: {
		project: {
			columns: {
				nodes: IProjectColumn[]
			}
		}
	}
}

export interface IGetOrganizationProjectItemsVariables {
	organizationName: string
	projectNumber: number
}

export const GET_ORGANIZATION_PROJECT_ITEMS = gql`
	query GetOrganizationProjectItems($organizationName: String!, $projectNumber: Int!) {
		organization(login: $organizationName) {
			project(number: $projectNumber) {
				columns(first: 8) {
					nodes {
						id
						name
						cards(first: 100, archivedStates: [NOT_ARCHIVED]) {
							nodes {
								id
								content {
									__typename
									... on Issue {
										id
										title
										url
										assignees(first: 5) {
											nodes {
												id
												name
												login
											}
										}
										labels(first: 10) {
											nodes {
												id
												name
											}
										}
									}
									... on PullRequest {
										id
										title
										url
										assignees(first: 5) {
											nodes {
												id
												name
												login
											}
										}
										labels(first: 10) {
											nodes {
												id
												name
											}
										}
									}
								}
								note
							}
						}
					}
				}
			}
		}
	}
`

export const useOrganizationProjectColumns = (
	organizationName: string,
	projectNumber: number,
	opts?: QueryHookOptions<IGetOrganizationProjectItemsData, IGetOrganizationProjectItemsVariables>,
) => {
	const { data, ...rest } = useQuery<IGetOrganizationProjectItemsData, IGetOrganizationProjectItemsVariables>(
		GET_ORGANIZATION_PROJECT_ITEMS,
		{
			...opts,
			variables: {
				organizationName,
				projectNumber,
			},
		},
	)

	return {
		...rest,
		data: data?.organization.project.columns.nodes,
	}
}
