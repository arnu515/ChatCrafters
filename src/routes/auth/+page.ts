import type { PageLoad } from "./$types"

export const load: PageLoad = ({ url }) => {
	const mode = url.searchParams.get("mode")?.toLowerCase()
	return { mode: mode === 'login' || mode === 'signup' ? mode : 'login' }
}

