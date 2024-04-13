import type { Persona, User } from '$lib/dbtypes'
import type { PageServerLoad } from './$types'

const LIMIT = 20

export const load: PageServerLoad = async event => {
	let q = (event.url.searchParams.get('q') || '').trim()
	let p = (event.url.searchParams.get('p') || '1').trim()
	let offset = 0
	if (!isNaN(parseInt(p))) {
		offset = (Math.max(parseInt(p), 1) - 1) * LIMIT
	}

	let baseQuery =
		'SELECT personas.*, users.username, users.avatar_url FROM personas INNER JOIN users ON personas.userId = users.id'

	// by:username
	// by_id:user_id
	// name, summary, and attire matching
	const whereQueries: string[] = ['private = ?']
	const whereBindings: (string | number)[] = [0]
	q.match(/by:[\w-]+/gi)?.forEach(x => {
		whereQueries.push('users.username = ?')
		whereBindings.push(x.replace('by:', ''))
	})
	q.match(/by_id:[\w-]+/gi)?.forEach(x => {
		whereQueries.push('users.id = ?')
		whereBindings.push(x.replace('by_id:', ''))
	})
	const query = q.replace(/by(_id)?:[\w-]+ ?/gi, '').trim()
	if (query) {
		whereQueries.push('personas.name LIKE ? OR personas.summary LIKE ? or personas.attire LIKE ?')
		const likeQ = `%${q}%`
		whereBindings.push(likeQ, likeQ, likeQ)
	}

	if (whereQueries.length) baseQuery += ' WHERE ' + whereQueries.join(' OR ')
	baseQuery += ' LIMIT ? OFFSET ?'

	return {
		personas: (
			await event
				.platform!.env.db.prepare(baseQuery)
				.bind(...whereBindings, LIMIT, offset)
				.all<Persona & { username: User['username']; avatar_url: User['avatar_url'] }>()
		).results
	}
}
