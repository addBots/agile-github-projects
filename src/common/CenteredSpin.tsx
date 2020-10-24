import React from "react"
import { LoadingOutlined } from "@ant-design/icons"
import { Spin } from "antd"
import { SpinProps } from "antd/lib/spin"

export const CenteredSpin: React.FC<SpinProps> = () => {
	const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />

	return (
		<Spin
			indicator={antIcon}
			style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
			tip="Lädt..."
		/>
	)
}
