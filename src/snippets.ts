import Ajv, { ValidateFunction } from 'ajv'
import { getGlobalSnippetSchema } from './chore/get-snippet-schema'
import { VscodeSchemasGlobalSnippets } from './types'
import { fetchJson } from './fetch'

let validate: ValidateFunction

export async function isValidSnippet(snippet: Record<string, any>) {
  if (!validate) {
    const txt = await getGlobalSnippetSchema()
    const schema = JSON.parse(txt)

    schema.$id = schema.id
    delete schema.id

    const ajv = new Ajv({
      strict: false,
    })

    validate = ajv.compile(schema)
  }

  const isValid = validate(snippet)

  return isValid
}

export async function fetchSnippet(
  url: string,
): Promise<false | VscodeSchemasGlobalSnippets> {
  try {
    const data = fetchJson(url)

    if (!(await isValidSnippet(data))) {
      return false
    }

    return data
  } catch (error) {
    console.warn(error)
    return false
  }
}
