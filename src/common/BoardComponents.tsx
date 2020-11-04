import { Col, Card } from "antd"
import styled from "styled-components"

export const FlexCol = styled(Col)`
	width: auto !important;
	flex: 1 1 0px !important;
	flex-basis: 150px !important;
	flex-grow: 1 !important;
	margin: 0px 10px;
	min-width: 250px;
	margin-bottom: 20px;
`

export const StickyCard = styled(Card)`
	& .ant-card-head {
		top: -20px;
		position: sticky;
		min-height: 32px;
		background-color: white;
	}

	& .ant-card-head-title {
		padding: 10px 0;
	}
`
