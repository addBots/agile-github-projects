import { Card, Col, Tag } from "antd"
import React from "react"
import styled from "styled-components"
import { FlexCol, StickyCard } from "./common/BoardComponents"
import { useConfig } from "./config"
import { useOrganizationProjectColumns } from "./graphql/queries/getOrganizationProjectColumns"

const IssueCard = styled(Card)`
	margin-top: 4px;

	& .ant-card-head-title {
		white-space: normal;
		font-size: 12px;
		font-weight: bold;
	}

	& .ant-card-head {
		padding: 0 12px;
	}

	& .ant-card-body {
		padding: 12px;
	}
`

interface IIssuesByColumnsProps {
	organization: string
	project: string
}

export const IssuesByColumns = ({ organization, project }: IIssuesByColumnsProps) => {
	const config = useConfig()

	const { data, loading, error } = useOrganizationProjectColumns(organization, parseInt(project), {
		pollInterval: config.behavior.pollInterval,
	})

	return (
		<>
			{data?.map((column) => (
				<FlexCol span={5} key={column.id}>
					<StickyCard title={column.name} bordered={false}>
						{(column.cards.nodes || []).map((issue) => (
							<IssueCard title={issue.content?.title} bordered key={issue.id}>
								<div>
									{(issue.content?.labels.nodes || []).map((label) => (
										<Tag color={`#${label.color}`} key={label.name} style={{ color: "black" }}>
											{label.name}
										</Tag>
									))}
								</div>
							</IssueCard>
						))}
					</StickyCard>
				</FlexCol>
			))}
		</>
	)
}
