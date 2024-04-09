import { fail } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions = {
	genImage: () => {
		return fail(500, { error: "Not implemented" })
	},
	create: () => {
		return fail(500, { error: "Not implemented" })
	}
} satisfies Actions

