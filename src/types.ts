/**
 * User snippet configuration
 */
export interface VscodeSchemasGlobalSnippets {
  [k: string]: {
    /**
     * The prefix to use when selecting the snippet in intellisense
     */
    prefix?: string | string[]
    body: string | string[]
    /**
     * The snippet description.
     */
    description?: string | string[]
    /**
     * A list of language names to which this snippet applies, e.g. 'typescript,javascript'.
     */
    scope?: string
  }
}

export interface SnippetConfig {
  url: string
  language: string
}

export interface RemoteSnippetsConfig {
  snippets: SnippetConfig[]
}
