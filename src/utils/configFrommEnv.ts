type GetValue = (varName: string) => string

declare const window: any

const getEnvValue = (name: string): string =>
	window["_env_"] && window["_env_"][name] ? window["_env_"][name] : process.env[name]!

export interface IDynamicConfigOpts<C> {
	required?: string[]
	make: (getValue: GetValue) => C
}

export const configFromEnv = <C>({ required, make }: IDynamicConfigOpts<C>) => {
	const requiredEnvVars = required || []

	for (const requiredEnvVar of requiredEnvVars) {
		if (getEnvValue(requiredEnvVar) === undefined) {
			throw new Error(`Missing environment variable ${requiredEnvVar}`)
		}
	}

	return make(getEnvValue)
}
