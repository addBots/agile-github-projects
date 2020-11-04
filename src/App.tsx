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
import { BoardView } from "./BoardView"
import { IssuesByAssignee } from "./IssuesByAssignee"
import { IssuesByLabels } from "./IssuesByLabels"
import { IssuesByColumns } from "./IssuesByColumns"

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
						redirectUrl="/board"
						exact
						render={() => <Login />}
					/>
					<PrivateRoute
						path="/board"
						isAuthenticated={isLoggedIn}
						fallbackUrl="/login"
						render={() => (
							<BoardView>
								{(props) => {
									if (props.view === "assignee") {
										return (
											<IssuesByAssignee
												organization={props.organization}
												project={props.project}
												columnNames={props.columns}
											/>
										)
									} else if (props.view === "labels") {
										return (
											<IssuesByLabels
												organization={props.organization}
												project={props.project}
												labelNames={props.labels}
											/>
										)
									} else if (props.view === "columns") {
										console.log(props)
										return (
											<IssuesByColumns
												organization={props.organization}
												project={props.project}
											/>
										)
									}

									return null
								}}
							</BoardView>
						)}
					/>
					<Route
						render={() => (
							<h3>
								404 Not Found (<a href="/board">Goto board</a>)
							</h3>
						)}
					/>
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
