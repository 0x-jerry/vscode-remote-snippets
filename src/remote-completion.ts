import {
  CompletionItem,
  CompletionItemKind,
  CompletionItemProvider,
  MarkdownString,
  SnippetString,
  TextDocument,
  window,
} from 'vscode'
import { SnippetBodyOption, VSCodeSchemasGlobalSnippets } from './types'
import { isFn, toArray } from '@0x-jerry/utils'

interface SnippetConfig {
  snippet: VSCodeSchemasGlobalSnippets
  language?: string
}

export class RemoteCompletionItemProvider implements CompletionItemProvider {
  configs = new Map<string, SnippetConfig>()

  #languages = new Set<string>()

  get languages() {
    return Array.from(this.#languages)
  }

  add(id: string, snippet: VSCodeSchemasGlobalSnippets, language?: string) {
    this.configs.set(id, {
      snippet,
      language,
    })

    Object.values(snippet).forEach((item) => {
      this.#setLanguages(item.scope)
    })

    this.#setLanguages(language)
  }

  #setLanguages(languages?: string) {
    languages?.split(',').forEach((item) => {
      this.#languages.add(item.trim())
    })
  }

  clear() {
    this.#languages.clear()
    this.configs.clear()
  }

  provideCompletionItems(document: TextDocument): CompletionItem[] {
    const items: CompletionItem[] = []

    const docLang = document.languageId

    const pos = window.activeTextEditor?.selection.active
    const currentLineText = pos ? document.lineAt(pos).text : ''

    const snippetBodyOption: SnippetBodyOption = {
      file: document.fileName,
      text: currentLineText,
    }

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

          const codeBody = isFn(snippet.body)
            ? snippet.body(snippetBodyOption)
            : snippet.body

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
