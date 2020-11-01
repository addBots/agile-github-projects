import { Select } from "antd"
import React from "react"
import { CenteredSpin } from "./common/CenteredSpin"
import { useOrganizations } from "./graphql/queries/getOrganizations"

interface IOrganizationSelectProps {
	organization: string | null
	onChange: (organization: string) => void
}

export const OrganizationSelect = ({ onChange, organization }: IOrganizationSelectProps) => {
	const { data: organizations, loading } = useOrganizations()

	if (loading) return <CenteredSpin />

	return (
		<Select
			value={organization || undefined}
			style={{ width: 250 }}
			onChange={(value) => (typeof value === "string" ? onChange(value) : undefined)}
			placeholder="Select an organization"
		>
			{organizations?.map((org) => (
				<Select.Option key={org.id} value={org.login}>
					{org.name}
				</Select.Option>
			))}
		</Select>
	)
}
