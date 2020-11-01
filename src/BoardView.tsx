import { Radio, Row } from "antd"
import React, { useMemo } from "react"
import styled from "styled-components"
import { ColumnSelect } from "./ColumnSelect"
import { LabelSelect } from "./LabelSelect"
import { OrganizationSelect } from "./OrganizationSelect"
import { ProjectSelect } from "./ProjectSelect"
import { useStore } from "./store"

const Header = styled.div`
	margin-bottom: 20px;
	display: flex;
	flex-direction: row;
	align-items: center;

	& > * {
		margin-right: 10px !important;
	}
`

const Container = styled.div`
	background: #ececec;
	padding: 20px 10px;
	overflow-y: auto;
`

interface IRenderBasePayload {
	organization: string
	project: string
}

interface IRenderByAssigneePayload extends IRenderBasePayload {
	view: "assignee"
	columns: string[]
}

interface IRenderByLabelPayload extends IRenderBasePayload {
	view: "labels"
	labels: string[]
}

interface IRenderByColumnPayload extends IRenderBasePayload {
	view: "columns"
}

type RenderPayload = IRenderByAssigneePayload | IRenderByLabelPayload | IRenderByColumnPayload

export interface IBoardViewProps {
	children: (data: RenderPayload) => any
}

export const BoardView = ({ children }: IBoardViewProps) => {
	const {
		organization,
		setOrganization,
		view,
		setView,
		project,
		setProject,
		columns,
		setColumns,
		labels,
		setLabels,
	} = useStore()

	const content = useMemo(() => {
		if (view === "assignee" && organization && project && columns) {
			return children({
				view,
				organization,
				project,
				columns,
			})
		} else if (view === "labels" && organization && project && labels) {
			return children({
				view,
				organization,
				project,
				labels,
			})
		} else if (view === "columns" && organization && project) {
			return children({
				view,
				organization,
				project,
			})
		}

		return null
	}, [view, organization, project, labels, columns, children])

	return (
		<div>
			<Header>
				<Radio.Group value={view} defaultValue="assignee" onChange={(e) => setView(e.target.value)}>
					<Radio.Button value="assignee">By Assignee</Radio.Button>
					<Radio.Button value="labels">By Labels</Radio.Button>
					<Radio.Button value="columns">By Columns</Radio.Button>
				</Radio.Group>
				<OrganizationSelect organization={organization} onChange={setOrganization} />
				{organization && <ProjectSelect organization={organization} project={project} onChange={setProject} />}
				{organization && project && view === "assignee" && (
					<ColumnSelect
						organization={organization}
						project={project}
						columns={columns}
						onChange={setColumns}
					/>
				)}
				{organization && project && view === "labels" && (
					<LabelSelect organization={organization} project={project} labels={labels} onChange={setLabels} />
				)}
			</Header>
			<Container>
				<Row>{content}</Row>
			</Container>
		</div>
	)
}
