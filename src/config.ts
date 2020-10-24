import React, { useContext } from "react"
import { configFromEnv } from "./utils/configFrommEnv"

export interface IConfig {
	github: {
		clientID: string
		gatekeeperEndpoint: string
		oauthLoginEndpoint: string
	}
	url: string
	behavior: {
		pollInterval: number
	}
	general: {
		labelSizeMatcher: RegExp
	}
}

export const config = configFromEnv<IConfig>({
	required: [
		"REACT_APP_GITHUB_CLIENT_ID",
		"REACT_APP_URL",
		"REACT_APP_GITHUB_GATEKEEPER_ENDPOINT",
		"REACT_APP_GITHUB_OAUTH_LOGIN_ENDPOINT",
	],
	make: (getValue) => ({
		github: {
			clientID: getValue("REACT_APP_GITHUB_CLIENT_ID"),
			gatekeeperEndpoint: getValue("REACT_APP_GITHUB_GATEKEEPER_ENDPOINT"),
			oauthLoginEndpoint: getValue("REACT_APP_GITHUB_OAUTH_LOGIN_ENDPOINT"),
		},
		url: getValue("REACT_APP_URL"),
		behavior: {
			pollInterval: parseInt(getValue("REACT_APP_POLL_INTERVAL")) || 60e3,
		},
		general: {
			labelSizeMatcher: /^size:([+-]?([0-9]*[.])?[0-9]+)$/,
		},
	}),
})

export const ConfigContext = React.createContext(config)

export const useConfig = () => useContext(ConfigContext)
