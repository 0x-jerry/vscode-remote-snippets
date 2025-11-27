import path from 'node:path'
import { ensureArray } from '@0x-jerry/utils'
import Ajv, { type ValidateFunction } from 'ajv'
import fs from 'fs-extra'
import { createJiti } from 'jiti'
import { Uri, window, workspace } from 'vscode'
import { getGlobalSnippetSchema } from './chore/get-snippet-schema'
import {
  localJSConfigs,
  remoteSnippets,
  remoteSnippetsConfigs,
} from './configuration'
import { fetchJson } from './fetch'
import type { RemoteCompletionItemProvider } from './remote-completion'
import { statusBar } from './statusBar'
import type {
  RemoteSnippetsConfig,
  SnippetConfig,
  VSCodeSchemasGlobalSnippets,
} from './types'

let validate: ValidateFunction

export async function isValidSnippet(snippet: Record<string, unknown>) {
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

  const jiti = createJiti(__filename, {
    moduleCache: false,
    fsCache: false,
  })

  for (const JSFile of localJSFiles) {
    if (!/\.js$/.test(JSFile)) continue

    const jsPath = path.join(workspaceUri.fsPath, JSFile)

    if (!(await fs.pathExists(jsPath))) {
      continue
    }

    try {
      const m: any = await jiti.import(jsPath)

      const snippets: VSCodeSchemasGlobalSnippets[] = ensureArray(m)

      for (const snippet of snippets) {
        provider.add(jsPath, snippet)
      }
    } catch (error) {
      console.error(error)

      window.showWarningMessage(
        `load snippet [${jsPath}] failed!: ${String(error)}`,
      )
    }
  }
}
