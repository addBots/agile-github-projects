import { IIssue } from "../graphql/queries/getOrganizationProjectColumns"

export const parseSizeLabel = (label: string, labelSizeMatcher: RegExp) => {
	let matches
	if (!(matches = label.match(labelSizeMatcher))) {
		return null
	}

	return parseFloat(matches[1])
}

export const getIssueSize = (issue: IIssue, labelSizeMatcher: RegExp) => {
	const sizeLabel = issue.labels.nodes.find((label) => label.name.match(labelSizeMatcher))

	if (sizeLabel) {
		return parseSizeLabel(sizeLabel.name, labelSizeMatcher)
	}

	return null
}
