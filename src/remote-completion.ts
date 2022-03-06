import {
  CompletionItem,
  CompletionItemKind,
  CompletionItemProvider,
  MarkdownString,
  SnippetString,
  TextDocument,
} from 'vscode'
import { VscodeSchemasGlobalSnippets } from './types'
import { toArray } from '@0x-jerry/utils'

interface SnippetConfig {
  snippet: VscodeSchemasGlobalSnippets
  language?: string
}

export class RemoteCompletionItemProvider implements CompletionItemProvider {
  configs = new Map<string, SnippetConfig>()

  add(url: string, snippet: VscodeSchemasGlobalSnippets, language?: string) {
    this.configs.set(url, {
      snippet,
      language,
    })
  }

  clear() {
    this.configs.clear()
  }

  provideCompletionItems(document: TextDocument): CompletionItem[] {
    const items: CompletionItem[] = []

    const docLang = document.languageId

    for (const conf of this.configs.values()) {
      const list = Object.entries(conf.snippet)
        .filter(([_name, w]) =>
          conf.language
            ? conf.language.includes(docLang)
            : w.scope
            ? w.scope.includes(docLang)
            : true,
        )
        .map(([title, snippet]) => {
          const item = new CompletionItem(title)
          item.kind = CompletionItemKind.Snippet

          const code = toArray(snippet.body).join('\n')

          item.insertText = new SnippetString(code)

          const documentation = [
            toArray(snippet.description).join('\n') || title,
            '',
            '```' + conf.language,
            code,
            '```',
          ].join('\n')

          item.documentation = new MarkdownString(documentation)
          return item
        })

      items.push(...list)
    }

    return items
  }
}
