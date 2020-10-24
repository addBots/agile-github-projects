import { gql } from "apollo-boost"
import { useQuery, QueryHookOptions } from "@apollo/react-hooks"

export interface IProject {
	id: string
	name: string
	number: number
}

export interface IGetOrganizationProjectsData {
	organization: {
		projects: {
			nodes: IProject[]
		}
	}
}

export interface IGetOrganizationProjectsVariables {
	organizationName: string
}

export const GET_ORGANIZATION_PROJECTS = gql`
	query GetOrganizationProjects($organizationName: String!) {
		organization(login: $organizationName) {
			projects(first: 100) {
				nodes {
					id
					name
					number
				}
			}
		}
	}
`

export const useOrganizationProjects = (
	organizationName: string,
	opts?: QueryHookOptions<IGetOrganizationProjectsData, IGetOrganizationProjectsVariables>,
) => {
	const { data, ...rest } = useQuery<IGetOrganizationProjectsData, IGetOrganizationProjectsVariables>(
		GET_ORGANIZATION_PROJECTS,
		{
			...opts,
			variables: {
				organizationName,
			},
		},
	)

	return {
		...rest,
		data: data?.organization.projects.nodes,
	}
}
