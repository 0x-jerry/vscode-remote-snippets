import { commands, ExtensionContext, languages, Uri } from 'vscode'
import { apiCache } from './fetch'
import { RemoteCompletionItemProvider } from './remote-completion'
import { cacheRemoteSnippets } from './snippets'

export async function activate(context: ExtensionContext) {
  console.log('activate')

  await apiCache.load()

  const provider = new RemoteCompletionItemProvider()

  cacheRemoteSnippets(provider)

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
    commands.registerCommand('remote-snippets.refresh', () => {
      provider.clear()
      apiCache.clear()

      cacheRemoteSnippets(provider)
    }),
  )
}

export async function deactivate(): Promise<void> {
  await apiCache.save()
  console.log('deactivate')
}
