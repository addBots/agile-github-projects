import React, { useEffect, useState } from "react"
import { useLocation, useHistory } from "react-router"
import { Link } from "react-router-dom"
import axios from "axios"
import { useApolloClient } from "@apollo/react-hooks"
import { setGitHubAuthToken } from "./graphql/mutations/setGithubAuthToken"
import { useConfig } from "./config"

const useURLQuery = () => {
	return new URLSearchParams(useLocation().search)
}

interface IGitHubAuthTokenResponse {
	token: string
}

const getGitHubAuthToken = (url: string, code: string) =>
	axios
		.get<IGitHubAuthTokenResponse>(`${url}/authenticate/${code}`, {
			headers: {
				Accept: "application/json",
			},
		})
		.then((response) => response.data.token)

export const GitHubCallback: React.FC = () => {
	const [state, setState] = useState<"pending" | "idle" | "failed" | "success">("idle")
	const {
		github: { gatekeeperEndpoint },
	} = useConfig()
	const urlQuery = useURLQuery()
	const client = useApolloClient()
	const history = useHistory()

	useEffect(() => {
		if (!urlQuery.has("code")) {
			return
		}

		const code = urlQuery.get("code")!

		if (state !== "idle") {
			return
		}

		setState("pending")

		getGitHubAuthToken(gatekeeperEndpoint, code)
			.then((authToken) => {
				setGitHubAuthToken(authToken)

				setState("success")
				history.push("/")
			})
			.catch((err) => {
				console.error(err)

				setState("failed")
			})
	}, [client, urlQuery, state, history, gatekeeperEndpoint])

	if (state === "pending") {
		return <p>Contacting GitHub, one moment please...</p>
	} else if (state === "failed") {
		return (
			<p>
				Something went wrong :( <Link to="/login">Retry</Link>
			</p>
		)
	}

	return null
}
