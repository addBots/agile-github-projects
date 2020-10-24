import React, { useCallback, useMemo } from "react"
import { useOrganizationProjects } from "./graphql/queries/getOrganizationProjects"
import { Select, Button, Radio } from "antd"
import { useHistory, Route, useParams, useRouteMatch, Redirect } from "react-router"
import styled from "styled-components"
import { useOrganizationProjectColumns } from "./graphql/queries/getOrganizationProjectColumns"
import createPersistedState from "use-persisted-state"
import { setGitHubAuthToken } from "./graphql/mutations/setGithubAuthToken"
import { RadioChangeEvent } from "antd/lib/radio"
import { labelsFromProjectColumns } from "./utils"
import { CenteredSpin } from "./common/CenteredSpin"
import { EditableTagGroup } from "./common/EditableTagGroup"
import { useRoutePaths } from "./hooks/useRoutePaths"
import { IProjectRoute } from "./types/RouteParams"

const IssuesByAssignee = React.lazy(() =>
	import("./IssuesByAssignee").then((module) => ({ default: module.IssuesByAssignee })),
)
const IssuesByLabels = React.lazy(() =>
	import("./IssuesByLabels").then((module) => ({ default: module.IssuesByLabels })),
)

const useColumnNames = createPersistedState("project.columnNames")
const useLabels = createPersistedState("project.labels")

const { Option } = Select

const Header = styled.div`
	margin-bottom: 20px;
	display: flex;
	flex-direction: row;
	align-items: center;

	& > * {
		margin-right: 10px !important;
	}
`

interface IHeaderColumnSelectionProps {
	selectedColumns: string[]
	setSelectedColumns: React.Dispatch<React.SetStateAction<string[]>>
}

const HeaderColumnSelection: React.FC<IHeaderColumnSelectionProps> = ({ selectedColumns, setSelectedColumns }) => {
	const { projectNumber } = useParams<IProjectRoute>()
	const { data: columns, loading, refetch } = useOrganizationProjectColumns("addBots", parseInt(projectNumber!))

	if (loading) return <CenteredSpin />

	return (
		<>
			<EditableTagGroup
				datasource={(columns || []).map((column) => column.name)}
				values={selectedColumns}
				placeholder="Select a column"
				onValuesChange={(newValues) => setSelectedColumns(newValues)}
				readOnly={!columns}
			/>
			<Button onClick={() => refetch()}>Refresh</Button>
		</>
	)
}

interface IHeaderLabelSelectionProps {
	selectedLabels: string[]
	setSelectedLabels: React.Dispatch<React.SetStateAction<string[]>>
}

const HeaderLabelSelection: React.FC<IHeaderLabelSelectionProps> = ({ selectedLabels, setSelectedLabels }) => {
	const { projectNumber } = useParams<IProjectRoute>()
	const { data: columns, loading, refetch } = useOrganizationProjectColumns("addBots", parseInt(projectNumber!))

	const labels = useMemo<string[]>(() => {
		if (!columns) return []

		return labelsFromProjectColumns(columns)
	}, [columns])

	if (loading) return <CenteredSpin />

	return (
		<>
			<EditableTagGroup
				datasource={labels}
				values={selectedLabels}
				placeholder="Select a label"
				onValuesChange={(newValues) => setSelectedLabels(newValues)}
				readOnly={!columns}
			/>
			<Button onClick={() => refetch()}>Refresh</Button>
		</>
	)
}

const ProjectViewSelection: React.FC = () => {
	const history = useHistory()
	const match = useRouteMatch()
	const routePaths = useRoutePaths()

	const onChangeView = useCallback(
		(event: RadioChangeEvent) => {
			history.push(`${match.url}/${event.target.value}`)
		},
		[history, match.url],
	)

	const selectedView = useMemo(
		() => routePaths.find((path) => path === "assignee") || routePaths.find((path) => path === "labels"),
		[routePaths],
	)

	if (!selectedView) {
		return <Redirect to={`${match.url}/assignee`} />
	}

	return (
		<Radio.Group value={selectedView} defaultValue="assignee" onChange={onChangeView}>
			<Radio.Button value="assignee">By Assignee</Radio.Button>
			<Radio.Button value="labels">By Labels</Radio.Button>
		</Radio.Group>
	)
}

export const Projects: React.FC = () => {
	const { data: projects, loading, error } = useOrganizationProjects("addBots")
	const [selectedColumns, setSelectedColumns] = useColumnNames<string[]>([])
	const [selectedLabels, setSelectedLabels] = useLabels<string[]>([])
	const history = useHistory()
	const routePaths = useRoutePaths()

	const selectedProjectNumber = useMemo(() => {
		if (routePaths.length >= 2 && routePaths[0] === "projects" && !isNaN(parseInt(routePaths[1]))) {
			return parseInt(routePaths[1])
		}

		return null
	}, [routePaths])

	const onSelectProject = useCallback(
		(projectNumber: unknown) => {
			history.push(`/projects/${projectNumber}`)
		},
		[history],
	)

	const logout = useCallback(() => {
		setGitHubAuthToken(null)

		history.push("/login")
	}, [history])

	if (error) return <p>{error.toString()}</p>

	return (
		<>
			<Header>
				<Select
					loading={loading}
					onChange={onSelectProject}
					placeholder="Select a project"
					style={{ width: 200 }}
					defaultValue={selectedProjectNumber || undefined}
				>
					{projects?.map((project) => (
						<Option key={project.id} value={project.number}>
							{project.name}
						</Option>
					))}
				</Select>
				<Route path="/projects/:projectNumber" render={() => <ProjectViewSelection />} />
				<Route
					path="/projects/:projectNumber/assignee"
					render={() => (
						<HeaderColumnSelection
							selectedColumns={selectedColumns}
							setSelectedColumns={setSelectedColumns}
						/>
					)}
				/>
				<Route
					path="/projects/:projectNumber/labels"
					render={() => (
						<HeaderLabelSelection selectedLabels={selectedLabels} setSelectedLabels={setSelectedLabels} />
					)}
				/>
				<Button onClick={logout} danger style={{ alignSelf: "flex-end" }}>
					Logout
				</Button>
			</Header>
			<Route
				path="/projects/:projectNumber/assignee"
				render={() => <IssuesByAssignee columnNames={selectedColumns} />}
			/>
			<Route
				path="/projects/:projectNumber/labels"
				render={() => <IssuesByLabels labelNames={selectedLabels} />}
			/>
		</>
	)
}
