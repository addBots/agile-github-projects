import React, { Suspense } from "react"
import { ApolloProvider } from "@apollo/react-hooks"
import { client, seedCache } from "./graphql/apolloClient"
import { useGitHubCredentials } from "./graphql/queries/useGitHubCredentials"
import { Login } from "./Login"
import { Route, Redirect, Switch } from "react-router"
import { BrowserRouter } from "react-router-dom"
import { GitHubCallback } from "./GitHubCallback"
import { createGlobalStyle } from "styled-components"
import { PublicRoute, PrivateRoute } from "./common/Routes"
import { CenteredSpin } from "./common/CenteredSpin"

const Projects = React.lazy(() => import("./Projects").then((module) => ({ default: module.Projects })))

seedCache()

const GlobaleStyle = createGlobalStyle`
	html,body {
		margin: 0;
		padding: 0;
		height: 100%;
	}

	#root {
		height: 100%;
		padding: 10px;
		display: flex;
		flex-direction: column;
	}
`

interface IRootProps {
	isLoggedIn: boolean
}

const Root: React.FC<IRootProps> = ({ isLoggedIn }) => {
	if (isLoggedIn) {
		return <Redirect to="/projects" />
	} else {
		return <Redirect to="/login" />
	}
}

const Routing: React.FC = () => {
	const { data, loading } = useGitHubCredentials()
	const isLoggedIn = data !== undefined && data.authToken !== null

	if (loading) return <CenteredSpin />

	return (
		<>
			<Route path="*" render={() => <GitHubCallback />} />
			<Suspense fallback={<CenteredSpin />}>
				<Switch>
					<Route path="/" exact render={() => <Root isLoggedIn={isLoggedIn} />} />
					<PublicRoute
						path="/login"
						isAuthenticated={isLoggedIn}
						redirectUrl="/projects"
						exact
						render={() => <Login />}
					/>
					<PrivateRoute
						path="/projects"
						isAuthenticated={isLoggedIn}
						fallbackUrl="/login"
						render={() => <Projects />}
					/>
					<Route render={() => <h3>404 Not Found</h3>} />
				</Switch>
			</Suspense>
		</>
	)
}

export const App: React.FC = () => (
	<ApolloProvider client={client}>
		<BrowserRouter>
			<Routing />
			<GlobaleStyle />
		</BrowserRouter>
	</ApolloProvider>
)
