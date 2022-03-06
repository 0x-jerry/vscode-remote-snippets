import { commands, ExtensionContext, languages, Uri } from 'vscode'
import { remoteSnippets, remoteSnippetsConfigs } from './configuration'
import { apiCache, fetchJson } from './fetch'
import { RemoteCompletionItemProvider } from './remote-completion'
import { fetchSnippet } from './snippets'
import { RemoteSnippetsConfig, SnippetConfig } from './types'

export async function activate(context: ExtensionContext) {
  console.log('activate')

  await apiCache.load()

  const provider = new RemoteCompletionItemProvider()

  cacheRemoteSnippets(provider)

  context.subscriptions.push(
    languages.registerCompletionItemProvider({ language: 'vue' }, provider),
  )

  context.subscriptions.push(
    commands.registerCommand('remote-snippets.refresh', () => {
      cacheRemoteSnippets(provider)
    }),
  )
}

async function cacheRemoteSnippets(provider: RemoteCompletionItemProvider) {
  const snippets = remoteSnippets()
  const configs = remoteSnippetsConfigs()

  const allConfigs = await Promise.all(
    configs.map(async (confUrl) => {
      const r = await fetchJson<Partial<RemoteSnippetsConfig>>(confUrl)

      const root = Uri.joinPath(Uri.parse(confUrl), '..')

      const isUrl = /^https?:\/\//

      const snippets: SnippetConfig[] = []

      for (const snippet of r.snippets || []) {
        if (!isUrl.test(snippet.url)) {
          snippet.url = Uri.joinPath(root, snippet.url).toString()
        }

        snippets.push(snippet)
      }

      return snippets
    }),
  )

  const allSnippets = [...snippets, ...allConfigs.flat()]

  console.log(allSnippets)

  for (const config of allSnippets) {
    const snippet = await fetchSnippet(config.url)

    if (snippet) {
      provider.add(config.url, config.language, snippet)
    }
  }
}

export async function deactivate(): Promise<void> {
  console.log('deactivate')
}
