import create from "zustand"

export type View = "assignee" | "labels"

export type State = {
	view: View
	organization: string | null
	project: string | null
	columns: string[] | null
	labels: string[] | null

	setView: (view: View) => void
	setOrganization: (organization: string) => void
	setProject: (project: string) => void
	setColumns: (columns: string[]) => void
	setLabels: (labels: string[]) => void
}

export const useStore = create<State>((set) => ({
	view: "assignee",
	organization: null,
	project: null,
	columns: null,
	labels: null,

	setView: (view) => set((state) => ({ ...state, view })),
	setOrganization: (organization) => set((state) => ({ ...state, organization })),
	setProject: (project) => set((state) => ({ ...state, project })),
	setColumns: (columns) => set((state) => ({ ...state, columns })),
	setLabels: (labels) => set((state) => ({ ...state, labels })),
}))
