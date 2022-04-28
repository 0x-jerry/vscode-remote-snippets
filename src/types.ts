import { Arrayable } from '@0x-jerry/utils'

/**
 * User snippet configuration
 */
export interface VSCodeSchemasGlobalSnippets {
  [k: string]: Snippet
}

export interface Snippet {
  /**
   * The prefix to use when selecting the snippet in intellisense
   */
  prefix?: Arrayable<string>
  /**
   * Maybe dynamic
   */
  body: Arrayable<string> | (() => Arrayable<string>)
  /**
   * The snippet description.
   */
  description?: Arrayable<string>
  /**
   * A list of language names to which this snippet applies, e.g. 'typescript,javascript'.
   */
  scope?: string
}

export interface SnippetConfig {
  path: string
  language?: string
}

export interface RemoteSnippetsConfig {
  contributes?: {
    snippets?: SnippetConfig[]
  }
}
