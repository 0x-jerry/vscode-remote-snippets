import { ExtensionContext, languages } from 'vscode'
import { snippetsConfig } from './configuration'
import { RemoteCompletionItemProvider } from './remote-completion'
import { fetchSnippet } from './snippets'

export async function activate(context: ExtensionContext) {
  console.log('activate')

  const provider = new RemoteCompletionItemProvider()

  cacheRemoteSnippets(provider)

  context.subscriptions.push(
    languages.registerCompletionItemProvider({ language: 'vue' }, provider),
  )
}

async function cacheRemoteSnippets(provider: RemoteCompletionItemProvider) {
  const configs = snippetsConfig()

  for (const config of configs) {
    const snippet = await fetchSnippet(config.url)

    if (snippet) {
      provider.add(config.url, config.language, snippet)
    }
  }
}

export function deactivate(): void {
  console.log('deactivate')
}
