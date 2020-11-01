module.exports = {
	extends: ["@addbots/eslint-config"],
	rules: process.env.REACT_APP_DEV_DISABLE_ESLINT
		? {
				"@typescript-eslint/no-unused-vars": 0,
				"no-empty-pattern": 0,
		  }
		: require("@addbots/eslint-config").rules,
}
