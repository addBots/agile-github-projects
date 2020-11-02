import { IIssue } from "../graphql/queries/getOrganizationProjectColumns"

export const sortIssuesByPriority = (issues: IIssue[], priorities: string[]) => {
	return issues.sort((lhs, rhs) => {
		const lhsPriority = lhs.labels.nodes.find((label) => priorities.includes(label.name))?.name || ""
		const rhsPriority = rhs.labels.nodes.find((label) => priorities.includes(label.name))?.name || ""

		return priorities.indexOf(lhsPriority) - priorities.indexOf(rhsPriority)
	})
}
