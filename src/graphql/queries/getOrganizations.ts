import { QueryHookOptions, useQuery } from "@apollo/react-hooks"
import { gql } from "apollo-boost"

export interface IOrganization {
	id: string
	name: string
	login: string
}

export interface IGetOrganizationsData {
	viewer: {
		organizations: {
			edges: {
				node: IOrganization
			}[]
		}
	}
}

export const GET_ORGANIZATIONS = gql`
	query GetOrganizations {
		viewer {
			organizations(first: 50) {
				edges {
					node {
						id
						name
						login
					}
				}
			}
		}
	}
`

export const useOrganizations = (opts?: QueryHookOptions<IGetOrganizationsData, void>) => {
	const { data, ...rest } = useQuery<IGetOrganizationsData, void>(GET_ORGANIZATIONS, opts)

	return {
		...rest,
		data: data?.viewer.organizations.edges.map((edge) => edge.node),
	}
}
