import { client } from "../apolloClient"

export const setGitHubAuthToken = (authToken: string | null) => {
	client.writeData({
		data: {
			github: {
				__typename: "GitHubCredentials",
				authToken,
			},
		},
	})

	if (authToken) {
		localStorage.setItem("authToken", authToken)
	} else {
		localStorage.removeItem("authToken")
	}
}
