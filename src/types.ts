/**
 * User snippet configuration
 *
 * https://transform.tools/json-schema-to-typescript
 */
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
