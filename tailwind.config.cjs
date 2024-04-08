/** @type {import('tailwindcss').Config}*/
const config = {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			fontFamily: {
				sans: ["Overpass Variable", "sans-serif"],
				mono: ["JetBrains Mono Variable", "monospace"]
			}
		}
	},

	plugins: [
		require("daisyui")
	]
}

module.exports = config
