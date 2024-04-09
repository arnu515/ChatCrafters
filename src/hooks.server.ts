import type { Handle } from '@sveltejs/kit';
import { getSession, saveSession } from '$lib/auth/sessions.server';
import type { SafeUser } from '$lib/dbtypes';

export const handle: Handle = async ({ event, resolve }) => {
	const session = await getSession(event.cookies);
	event.locals.session = session ?? null;
	if (session?.userId) {
		// fetch the creator
		const maybeUser = await event.platform!.env.db.prepare(`select id, username, email, avatar_url, created_at, is_banned from users where id = ?1 limit 1`).bind(session.userId).first<(SafeUser & { isBanned: boolean }) | null>();
		if (!maybeUser) {
			await saveSession({ ...session, userId: undefined }, event.cookies);
			event.locals.user = undefined;
		} else {
			const { isBanned, ...safeUser } = maybeUser;
			if (isBanned) {
				await saveSession({ ...session, userId: undefined }, event.cookies);
				event.locals.user = undefined;
			} else {
				event.locals.user = safeUser;
			}
		}
	}

	return resolve(event);
};
