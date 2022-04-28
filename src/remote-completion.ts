import {
  CompletionItem,
  CompletionItemKind,
  CompletionItemProvider,
  MarkdownString,
  SnippetString,
  TextDocument,
} from 'vscode'
import { VSCodeSchemasGlobalSnippets } from './types'
import { is, toArray } from '@0x-jerry/utils'

interface SnippetConfig {
  snippet: VSCodeSchemasGlobalSnippets
  language?: string
}

export class RemoteCompletionItemProvider implements CompletionItemProvider {
  configs = new Map<string, SnippetConfig>()

  add(id: string, snippet: VSCodeSchemasGlobalSnippets, language?: string) {
    this.configs.set(id, {
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
          const label: string = toArray(snippet.prefix)[0] || title

          const item = new CompletionItem(label, CompletionItemKind.Snippet)

          item.detail = title

          const codeBody = is.fn(snippet.body) ? snippet.body() : snippet.body

          const code = toArray(codeBody).join('\n')

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
