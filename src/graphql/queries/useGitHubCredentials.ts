import { gql } from "apollo-boost"
import { useQuery, QueryHookOptions } from "@apollo/react-hooks"

export interface IGitHubCredentialsData {
	github: {
		__typename: "GitHubCredentials"
		clientID: string
		authToken: string | null
	}
}

export const GET_GITHUB_CREDENTIALS = gql`
	{
		github @client {
			clientID
			authToken
		}
	}
`

export const useGitHubCredentials = (opts?: QueryHookOptions<IGitHubCredentialsData, void>) => {
	const { data, ...rest } = useQuery<IGitHubCredentialsData, void>(GET_GITHUB_CREDENTIALS, opts)

	return {
		...rest,
		data: data?.github,
	}
}
