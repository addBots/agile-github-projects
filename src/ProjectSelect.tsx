import { Select } from "antd"
import React from "react"
import { CenteredSpin } from "./common/CenteredSpin"
import { useOrganizationProjects } from "./graphql/queries/getOrganizationProjects"

interface IProjectSelectProps {
	organization: string
	project: string | null
	onChange: (organization: string) => void
}

export const ProjectSelect = ({ onChange, organization, project }: IProjectSelectProps) => {
	const { data: projects, loading } = useOrganizationProjects(organization)

	if (loading) return <CenteredSpin />

	return (
		<Select
			value={project || undefined}
			style={{ width: 250 }}
			onChange={(value) => onChange(value)}
			placeholder="Select a project"
		>
			{projects?.map((project) => (
				<Select.Option key={project.id} value={project.number}>
					{project.name}
				</Select.Option>
			))}
		</Select>
	)
}
