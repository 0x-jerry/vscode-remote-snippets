import {
  CompletionItem,
  CompletionItemKind,
  CompletionItemProvider,
  MarkdownString,
  SnippetString,
} from 'vscode'
import { VscodeSchemasGlobalSnippets } from './types'
import { toArray } from '@0x-jerry/utils'


export class RemoteCompletionItemProvider implements CompletionItemProvider {
  configs = new Map<
    string,
    {
      snippet: VscodeSchemasGlobalSnippets
      language: string
    }
  >()

  add(url: string, language: string, snippet: VscodeSchemasGlobalSnippets) {
    this.configs.set(url, {
      language,
      snippet,
    })
  }

  provideCompletionItems(): CompletionItem[] {
    const items: CompletionItem[] = []

    for (const conf of this.configs.values()) {
      const list = Object.entries(conf.snippet)
        .filter(
          ([_name, w]) => w.scope == null || w.scope.includes(conf.language),
        )
        .map(([name, i]) => {
          const item = new CompletionItem(name)
          item.kind = CompletionItemKind.Snippet

          const code = toArray(i.body).join('\n')
          const snippet = new SnippetString(code)

          item.insertText = snippet

          const documentation = [
            i.description,
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
