import {
  commands,
  Disposable,
  ExtensionContext,
  languages,
  workspace,
} from 'vscode'
import { Commands } from './const'
import { apiCache } from './fetch'
import { RemoteCompletionItemProvider } from './remote-completion'
import { cacheRemoteSnippets, loadLocalDynamicSnippets } from './snippets'
import { statusBar } from './statusBar'

export async function activate(context: ExtensionContext) {
  console.log('activate')

  await apiCache.load()

  const provider = new RemoteCompletionItemProvider()

  const refreshSnippets = async () => {
    await cacheRemoteSnippets(provider)
    await loadLocalDynamicSnippets(provider)
  }

  await refreshSnippets()

  context.subscriptions.push(statusBar.instance)

  let unregister: Disposable | null = null

  updateCompletionProviderLanguages()

  function updateCompletionProviderLanguages() {
    unregister?.dispose()

    const supportedLang = provider.languages

    unregister = languages.registerCompletionItemProvider(
      supportedLang.map((n) => ({
        language: n,
      })),
      provider,
    )
  }

  context.subscriptions.push({
    dispose: () => unregister?.dispose(),
  })

  context.subscriptions.push(
    commands.registerCommand(Commands.Refresh, () => {
      apiCache.clear()
      provider.clear()

      refreshSnippets()
    }),
  )

  context.subscriptions.push(
    workspace.onDidChangeConfiguration(async (e) => {
      if (!e.affectsConfiguration('remote-snippets')) {
        return
      }

      provider.clear()
      await refreshSnippets()
      updateCompletionProviderLanguages()
    }),
  )
}

export async function deactivate(): Promise<void> {
  apiCache.saveSync()
}
