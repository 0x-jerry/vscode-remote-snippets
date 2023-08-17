import Ajv, { ValidateFunction, _ } from 'ajv'
import { getGlobalSnippetSchema } from './chore/get-snippet-schema'
import {
  RemoteSnippetsConfig,
  SnippetConfig,
  VSCodeSchemasGlobalSnippets,
} from './types'
import { fetchJson } from './fetch'
import { Uri, workspace } from 'vscode'
import {
  localJSConfigs,
  remoteSnippets,
  remoteSnippetsConfigs,
} from './configuration'
import { RemoteCompletionItemProvider } from './remote-completion'
import { statusBar } from './statusBar'
import path from 'path'
import fs from 'fs-extra'
import { toArray } from '@0x-jerry/utils'
import jiti from 'jiti'

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
): Promise<false | VSCodeSchemasGlobalSnippets> {
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

  statusBar.loading()

  const allConfigs = await Promise.all(
    configs.map((confUrl) => resolveRemoteSnippetConfig(confUrl)),
  )

  const allSnippets = [...snippets, ...allConfigs.flat()]

  const progress = {
    current: 0,
    total: allSnippets.length,
  }

  statusBar.updateProgress(progress.current, progress.total)
  for (const config of allSnippets) {
    const snippet = await fetchSnippet(config.path)

    statusBar.updateProgress(++progress.current, progress.total)

    if (!snippet) {
      continue
    }

    provider.add(config.path, snippet, config.language)
  }

  return allSnippets
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

/**
 * @todo Watch js files, then re-require the modified js file.
 * @param provider
 * @returns
 */
export async function loadLocalDynamicSnippets(
  provider: RemoteCompletionItemProvider,
) {
  const workspaceUri = workspace.workspaceFolders?.[0].uri
  if (!workspaceUri) return

  const localJSFiles = localJSConfigs()

  const load = jiti(process.cwd(), {
    cache: false,
  })

  for (const JSFile of localJSFiles) {
    if (!/\.js$/.test(JSFile)) continue

    const jsPath = path.join(workspaceUri.fsPath, JSFile)

    if (!(await fs.pathExists(jsPath))) {
      continue
    }

    const m = load(jsPath)

    const snippets: VSCodeSchemasGlobalSnippets[] = toArray(m.default || [])

    for (const snippet of snippets) {
      provider.add(jsPath, snippet)
    }
  }
}
