import { useHistory } from "react-router"

export const useRoutePaths = () => {
	const history = useHistory()

	const pathSplit = history.location.pathname.split("/").filter((path) => path.length > 0)

	return pathSplit
}
