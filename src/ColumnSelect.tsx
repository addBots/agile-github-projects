import { Select } from "antd"
import React from "react"
import { CenteredSpin } from "./common/CenteredSpin"
import { useOrganizationProjectColumns } from "./graphql/queries/getOrganizationProjectColumns"

interface IColumnSelectProps {
	organization: string
	project: string
	columns: string[] | null
	onChange: (columns: string[]) => void
}

export const ColumnSelect = ({ onChange, organization, project, columns }: IColumnSelectProps) => {
	const { data: availableColumns, loading } = useOrganizationProjectColumns(organization, parseInt(project))
	console.log(availableColumns)

	if (loading) return <CenteredSpin />

	return (
		<Select
			value={columns || undefined}
			style={{ width: 400 }}
			onChange={(value) => onChange(value)}
			placeholder="Select project column(s)"
			mode="tags"
		>
			{availableColumns?.map((column) => (
				<Select.Option key={column.id} value={column.name}>
					{column.name}
				</Select.Option>
			))}
		</Select>
	)
}
