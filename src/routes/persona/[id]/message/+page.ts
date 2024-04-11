import { redirect } from '@sveltejs/kit'
import type { PageLoad } from './$types'

export const load: PageLoad = event => {
	redirect(302, `/persona/${event.params.id}`)
}
