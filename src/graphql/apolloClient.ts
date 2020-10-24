import { ApolloClient } from "apollo-client"
import { setContext } from "apollo-link-context"
import { onError } from "apollo-link-error"
import { config } from "../config"
import { GET_GITHUB_CREDENTIALS, IGitHubCredentialsData } from "./queries/useGitHubCredentials"
import { HttpLink, ApolloLink, InMemoryCache, IntrospectionFragmentMatcher } from "apollo-boost"
import introspectionQueryResultData from "./fragmentTypes.json"
import { setGitHubAuthToken } from "./mutations/setGithubAuthToken"

const typeDefs = `
	type GitHubCredentials{
		clientID: String!
		authToken: String
	}
`

const fragmentMatcher = new IntrospectionFragmentMatcher({
	introspectionQueryResultData,
})

const httpLink = new HttpLink({
	uri: "https://api.github.com/graphql",
})

const authMiddlewareLink = setContext(() => {
	const authToken = localStorage.getItem("authToken")
	const headers: any = {
		headers: {
			authorization: `bearer ${authToken}`,
		},
	}

	return headers
})

const errorLink = onError(({ graphQLErrors, networkError }) => {
	if (graphQLErrors) {
		for (const error of graphQLErrors) {
			if (error.message === "Bad credentials") {
				setGitHubAuthToken(null)
				window.location.href = "/login"
			} else {
				console.error(error)
			}
		}
	}

	if (networkError) {
		console.error(networkError)
	}
})

const cache = new InMemoryCache({ fragmentMatcher })

export const client = new ApolloClient({
	link: ApolloLink.from([errorLink, authMiddlewareLink, httpLink]),
	cache,
	resolvers: {},
	typeDefs,
})

export const seedCache = () => {
	cache.writeQuery<IGitHubCredentialsData, void>({
		query: GET_GITHUB_CREDENTIALS,
		data: {
			github: {
				__typename: "GitHubCredentials",
				...config.github,
				authToken: localStorage.getItem("authToken"),
			},
		},
	})
}
