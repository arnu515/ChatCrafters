import { fail } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions = {
	default: () => {
		return fail(500, { error: "Not implemented" })
	}
} satisfies Actions

