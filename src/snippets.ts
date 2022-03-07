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
    const data = await fetchJson(url)

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
    const snippet = await fetchSnippet(config.path)

    if (!snippet) {
      continue
    }

    provider.add(config.path, snippet, config.language)
  }
}

async function resolveRemoteSnippetConfig(
  remoteConfigUrl: string,
): Promise<SnippetConfig[]> {
  const r = await fetchJson<RemoteSnippetsConfig>(remoteConfigUrl)

  const root = Uri.joinPath(Uri.parse(remoteConfigUrl), '..')

  const isUrl = /^https?:\/\//

  const snippetConfigs: SnippetConfig[] = []

  const remoteSnippetConfigs = r.contributes?.snippets || []

  for (const snippetConfig of remoteSnippetConfigs) {
    if (!isUrl.test(snippetConfig.path)) {
      snippetConfig.path = Uri.joinPath(root, snippetConfig.path).toString()
    }

    snippetConfigs.push(snippetConfig)
  }

  return snippetConfigs
}
