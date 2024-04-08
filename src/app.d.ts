// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { D1Database, CfProperties, CacheStorage, ExecutionContext } from "@cloudflare/workers-types"
import type { SafeUser } from "$lib/dbtypes";
import type { Session } from "$lib/auth/sessions.server"

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user?: SafeUser | null;
			session?: Session | null;
		}
		interface PageData {
			user?: SafeUser | null;
		}
		// interface PageState {}
		interface Platform {
			caches: CacheStorage,
			cf: CfProperties,
			context: ExecutionContext,
			env: {
				db: D1Database
			}
		}
	}
}

export { }
