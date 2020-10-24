import React from "react"
import { Route, Redirect, RouteProps } from "react-router"

interface IPrivateRouteProps extends Omit<RouteProps, "component"> {
	isAuthenticated: (() => boolean) | boolean
	fallbackUrl: string
}

export const PrivateRoute: React.FC<IPrivateRouteProps> = ({ render, isAuthenticated, fallbackUrl, ...rest }) => {
	const isLoggedIn = typeof isAuthenticated === "function" ? isAuthenticated() : isAuthenticated

	return (
		<Route
			{...rest}
			render={(props) =>
				isLoggedIn && render ? (
					render(props)
				) : (
					<Redirect
						to={{ pathname: fallbackUrl, state: { from: props.location }, search: props.location.search }}
					/>
				)
			}
		/>
	)
}

interface IPublicRouteProps extends Omit<RouteProps, "component"> {
	isAuthenticated?: (() => boolean) | boolean
	redirectUrl?: string
}

export const PublicRoute: React.FC<IPublicRouteProps> = ({ render, isAuthenticated, redirectUrl, ...rest }) => {
	const isLoggedIn = typeof isAuthenticated === "function" ? isAuthenticated() : isAuthenticated

	if (isLoggedIn === undefined && redirectUrl !== undefined) {
		console.warn(
			`PublicRoute: To redirect an authenticated user you must provide both isAuthenticated and redirectUrl props`,
		)
	}

	return (
		<Route
			{...rest}
			render={(props) =>
				isLoggedIn ? (
					<Redirect to={{ pathname: redirectUrl, state: { from: props.location } }} />
				) : (
					render && render(props)
				)
			}
		/>
	)
}
