import { Card, Dropdown, Menu, message, Spin, Tag } from "antd"
import React, { useCallback } from "react"
import styled from "styled-components"
import { FlexCol, StickyCard } from "./common/BoardComponents"
import { useConfig } from "./config"
import { useMoveProjectCards } from "./graphql/mutations/moveProjectCards"
import { IProjectColumn, useOrganizationProjectColumns } from "./graphql/queries/getOrganizationProjectColumns"
import { filterNull } from "./utils"
import { sortIssuesByPriority } from "./utils/issueSort"
import { DownOutlined } from "@ant-design/icons"

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

	const { data } = useOrganizationProjectColumns(organization, parseInt(project), {
		pollInterval: config.behavior.pollInterval,
	})

	return (
		<>
			{data?.map((column) => (
				<FlexCol span={5} key={column.id}>
					<StickyCard
						title={
							<div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start" }}>
								{column.name} <ColumnActions column={column} />
							</div>
						}
						bordered={false}
					>
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

interface IColumnActionsProps {
	column: IProjectColumn
}

const ColumnActions = ({ column }: IColumnActionsProps) => {
	const [moveProjectCards, { isLoading: isMovingCards }] = useMoveProjectCards({
		onMutate: () => {
			message.loading({
				content: `Sorting project column ${column.name}`,
				key: "isMovingCards",
			})
		},
		onSuccess: () => {
			message.success({
				content: `Successfully sorted project column ${column.name}`,
				key: "isMovingCards",
			})
		},
		onError: () => {
			message.error({
				content: `Sorting project column ${column.name} failed`,
				key: "isMovingCards",
			})
		},
	})

	const onClickSortByPriority = useCallback(async () => {
		const issuesSorted = sortIssuesByPriority(
			column.cards.nodes
				.map((node) => (node.content ? { ...node.content, cardId: node.id } : null))
				.filter(filterNull),
			["priority:high", "priority:mid", "priority:low"],
		).filter((issue) => issue.labels.nodes.some((label) => label.name.startsWith("priority:")))

		await moveProjectCards(
			issuesSorted.map((issue, idx) => ({
				afterCardId: idx === 0 ? null : issuesSorted[idx - 1].id,
				cardId: issue.cardId,
				columnId: column.id,
			})),
		)
	}, [moveProjectCards, column])

	const overlay = (
		<Menu>
			<Menu.Item onClick={onClickSortByPriority}>Sort by Priority</Menu.Item>
		</Menu>
	)

	return (
		<div style={{ alignSelf: "flex-end", marginLeft: "auto" }}>
			{isMovingCards && <Spin />}
			{!isMovingCards && (
				<Dropdown overlay={overlay}>
					<span style={{ color: "#1890ff" }}>
						Actions <DownOutlined />
					</span>
				</Dropdown>
			)}
		</div>
	)
}
