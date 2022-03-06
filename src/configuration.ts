import { workspace } from 'vscode'

interface SnippetConfig {
  url: string
  language: string
}

export const snippetsConfig = () => {
  const config = workspace.getConfiguration('remote-snippets')
  const snippets = config.get<SnippetConfig[]>('snippets') || []

  return snippets
}
