import { commands, ExtensionContext, languages, workspace } from 'vscode'
import { Commands } from './const'
import { apiCache } from './fetch'
import { RemoteCompletionItemProvider } from './remote-completion'
import { cacheRemoteSnippets, loadLocalDynamicSnippets } from './snippets'
import { statusBar } from './statusBar'

export async function activate(context: ExtensionContext) {
  console.log('activate')

  await apiCache.load()

  const provider = new RemoteCompletionItemProvider()

  const refreshSnippets = () => {
    cacheRemoteSnippets(provider)
    loadLocalDynamicSnippets(provider)
  }

  refreshSnippets()

  context.subscriptions.push(statusBar.instance)

  const supportedLang = ['vue', 'typescript', 'javascript', 'markdown']

  context.subscriptions.push(
    languages.registerCompletionItemProvider(
      supportedLang.map((n) => ({
        language: n,
      })),
      provider,
    ),
  )

  context.subscriptions.push(
    commands.registerCommand(Commands.Refresh, () => {
      apiCache.clear()
      provider.clear()

      refreshSnippets()
    }),
  )

  context.subscriptions.push(
    workspace.onDidChangeConfiguration((e) => {
      if (!e.affectsConfiguration('remote-snippets')) {
        return
      }

      provider.clear()
      refreshSnippets()
    }),
  )
}

export async function deactivate(): Promise<void> {
  apiCache.saveSync()
  console.log('deactivate')
}
