import { IProjectColumn } from "./graphql/queries/getOrganizationProjectColumns"
import { uniq, flattenDeep } from "lodash"

export function filterNull<Value>(value: Value | null): value is Value {
	return value !== null
}

export function filterUndefined<Value>(value: Value | undefined): value is Value {
	return value !== undefined
}

export const labelsFromProjectColumns = (data: IProjectColumn[]): string[] => {
	return uniq(
		flattenDeep(
			data.map((column) =>
				column.cards.nodes.map((card) =>
					card.content ? card.content.labels.nodes.map((label) => label.name) : [],
				),
			),
		)
			.filter(filterNull)
			.filter(filterUndefined),
	)
}

export const mapColumnToColor = (columnName: string): string => {
	const searchSpace = columnName.toLowerCase()

	if (searchSpace.indexOf("backlog") > -1) return "black"
	if (searchSpace.indexOf("todo") > -1) return "#c0392b"
	if (searchSpace.indexOf("progress") > -1) return "#f39c12"
	if (searchSpace.indexOf("done") > -1) return "#27ae60"

	return "inherit"
}
