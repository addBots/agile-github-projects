import React, { useCallback } from "react"
import { Button } from "antd"
import { useConfig } from "./config"

export const Login: React.FC = () => {
	const {
		github: { clientID, oauthLoginEndpoint },
		url,
	} = useConfig()

	const performLogin = useCallback(() => {
		const githubLoginUrl = `${oauthLoginEndpoint}?client_id=${clientID}&scope=repo,read:org,user,public_repo,repo:statusredirect_uri=${url}`

		window.location.href = githubLoginUrl
	}, [clientID, url, oauthLoginEndpoint])

	return (
		<Button type="primary" size="large" onClick={performLogin}>
			GitHub Login
		</Button>
	)
}
