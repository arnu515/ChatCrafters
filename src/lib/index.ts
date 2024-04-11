import { customAlphabet, urlAlphabet } from 'nanoid'

export const genId = customAlphabet(urlAlphabet, 24)
