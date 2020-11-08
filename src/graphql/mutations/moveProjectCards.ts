import { useApolloClient } from "@apollo/react-hooks"
import { FetchResult, gql } from "apollo-boost"
import { MutationConfig, useMutation } from "react-query"
import { v4 as uuid } from "uuid"
import { IProjectCard } from "../queries/getOrganizationProjectColumns"

interface IMoveProjectCardUpdate {
	afterCardId: string | null
	cardId: string
	columnId: string
}

interface IMoveProjectCardInput extends IMoveProjectCardUpdate {
	clientMutationId: string
}

interface IMoveProjectCardVariables {
	input: IMoveProjectCardInput
}

interface IMoveProjectCardData {
	moveProjectCard: {
		clientMutationId: string
		cardEdge: {
			cursor: string
			node: IProjectCard
		}
	}
}

export const MOVE_PROJECT_CARD = gql`
	mutation MoveProjectCard($input: MoveProjectCardInput!) {
		moveProjectCard(input: $input) {
			clientMutationId
			cardEdge {
				cursor
				node {
					id
					note
				}
			}
		}
	}
`

export const useMoveProjectCards = (opts?: MutationConfig<void, unknown, IMoveProjectCardUpdate[]>) => {
	const client = useApolloClient()

	return useMutation(async (variables) => {
		const clientMutationId = uuid()
		let afterCardId: string | null = null

		for (let i = 0; i < variables.length; i++) {
			const variable = variables[i]

			const moveCardResult: FetchResult<IMoveProjectCardData> = await client.mutate<
				IMoveProjectCardData,
				IMoveProjectCardVariables
			>({
				mutation: MOVE_PROJECT_CARD,
				variables: {
					input: {
						...variable,
						clientMutationId,
						afterCardId,
					},
				},
				refetchQueries: i === variables.length - 1 ? ["GetOrganizationProjectItems"] : undefined,
				awaitRefetchQueries: true,
			})

			afterCardId = moveCardResult.data?.moveProjectCard.cardEdge.node.id || null
		}
	}, opts)
}
