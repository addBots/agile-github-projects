import { debounce } from "debounce"
import create from "zustand"

export type View = "assignee" | "labels"

type StateData = {
	view: View
	organization: string | null
	project: string | null
	columns: string[] | null
	labels: string[] | null
}

type StateActions = {
	setView: (view: View) => void
	setOrganization: (organization: string) => void
	setProject: (project: string) => void
	setColumns: (columns: string[]) => void
	setLabels: (labels: string[]) => void
}

export type State = StateData & StateActions

const defaultStoreDate: StateData = {
	view: "assignee",
	organization: null,
	project: null,
	columns: null,
	labels: null,
}

const LOCAL_STORAGE_KEY = "de.addbots.agilegithubprojects.zustand"

const zustandFromLocaleStorage = (): StateData | null => {
	try {
		const parsedData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "null")

		if (!parsedData) return null

		return parsedData // TODO check data schema
	} catch (err) {
		console.error(err)

		return null
	}
}

const zustandToLocalStorage = (state: State) => {
	localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state))
}

export const useStore = create<State>((set) => ({
	...(zustandFromLocaleStorage() || defaultStoreDate),

	setView: (view) => set((state) => ({ ...state, view })),
	setOrganization: (organization) => set((state) => ({ ...state, organization })),
	setProject: (project) => set((state) => ({ ...state, project })),
	setColumns: (columns) => set((state) => ({ ...state, columns })),
	setLabels: (labels) => set((state) => ({ ...state, labels })),
}))

useStore.subscribe(debounce(zustandToLocalStorage, 1000))
