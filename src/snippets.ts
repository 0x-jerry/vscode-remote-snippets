import Ajv, { ValidateFunction } from 'ajv'
import { getGlobalSnippetSchema } from './chore/get-snippet-schema'
import {
  RemoteSnippetsConfig,
  SnippetConfig,
  VscodeSchemasGlobalSnippets,
} from './types'
import { fetchJson } from './fetch'
import { Uri } from 'vscode'
import { remoteSnippets, remoteSnippetsConfigs } from './configuration'
import { RemoteCompletionItemProvider } from './remote-completion'

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

export async function cacheRemoteSnippets(
  provider: RemoteCompletionItemProvider,
) {
  const snippets = remoteSnippets()
  const configs = remoteSnippetsConfigs()

  const allConfigs = await Promise.all(
    configs.map((confUrl) => resolveRemoteSnippetConfig(confUrl)),
  )

  const allSnippets = [...snippets, ...allConfigs.flat()]

  for (const config of allSnippets) {
    const snippet = await fetchSnippet(config.url)

    if (!snippet) {
      continue
    }

    provider.add(config.url, snippet, config.language)
  }
}

async function resolveRemoteSnippetConfig(
  remoteConfigUrl: string,
): Promise<SnippetConfig[]> {
  const r = await fetchJson<Partial<RemoteSnippetsConfig>>(remoteConfigUrl)

  const root = Uri.joinPath(Uri.parse(remoteConfigUrl), '..')

  const isUrl = /^https?:\/\//

  const snippets: SnippetConfig[] = []

  for (const snippet of r.snippets || []) {
    if (!isUrl.test(snippet.url)) {
      snippet.url = Uri.joinPath(root, snippet.url).toString()
    }

    snippets.push(snippet)
  }

  return snippets
}
