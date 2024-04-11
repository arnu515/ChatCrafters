import type { PageLoad } from './$types'
import { userGuard } from '$lib/auth'

export const load: PageLoad = async ({ parent, url }) => {
	userGuard(await parent(), url)
}
