import type { PageLoad } from './$types'

export const load: PageLoad = ({ url }) => {
	const mode = url.searchParams.get('mode')?.toLowerCase()
	const next = url.searchParams.get('mode')
	return { mode: mode === 'login' || mode === 'signup' ? mode : 'login', next: next?.trim() || '/' }
}
