import { useApolloClient } from "@apollo/react-hooks"
import { gql } from "apollo-boost"
import { useMutation } from "react-query"
import { v4 as uuid } from "uuid"

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

export const MOVE_PROJECT_CARD = gql`
	mutation MoveProjectCard($input: MoveProjectCardInput!) {
		moveProjectCard(input: $input) {
			clientMutationId
		}
	}
`

export const useMoveProjectCards = () => {
	const client = useApolloClient()

	return useMutation<void, unknown, IMoveProjectCardUpdate[]>(async (variables) => {
		const clientMutationId = uuid()

		for (let i = 0; i < variables.length; i++) {
			const variable = variables[i]

			await client.mutate<void, IMoveProjectCardVariables>({
				mutation: MOVE_PROJECT_CARD,
				variables: {
					input: {
						...variable,
						clientMutationId,
					},
				},
				refetchQueries: i === variables.length - 1 ? ["GetOrganizationProjectItems"] : undefined,
				awaitRefetchQueries: true,
			})
		}
	})
}
