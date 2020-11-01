import { Select } from "antd"
import React, { useMemo } from "react"
import { CenteredSpin } from "./common/CenteredSpin"
import { useOrganizationProjectColumns } from "./graphql/queries/getOrganizationProjectColumns"
import { labelsFromProjectColumns } from "./utils"

interface ILabelSelectProps {
	organization: string
	project: string
	labels: string[] | null
	onChange: (columns: string[]) => void
}

export const LabelSelect = ({ onChange, organization, project, labels }: ILabelSelectProps) => {
	const { data: availableColumns, loading, refetch } = useOrganizationProjectColumns(organization, parseInt(project))
	console.log(availableColumns)

	const availableLabels = useMemo<string[]>(() => {
		if (!availableColumns) return []

		return labelsFromProjectColumns(availableColumns)
	}, [availableColumns])

	if (loading) return <CenteredSpin />

	return (
		<Select
			value={labels || undefined}
			style={{ width: 400 }}
			onChange={(value) => onChange(value)}
			placeholder="Select issue label(s)"
			mode="tags"
		>
			{availableLabels?.map((label) => (
				<Select.Option key={label} value={label}>
					{label}
				</Select.Option>
			))}
		</Select>
	)
}
