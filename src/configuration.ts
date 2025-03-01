import { workspace } from 'vscode'
import type { SnippetConfig } from './types'

function getConf<T>(key: string): T | undefined
function getConf<T>(key: string, defaultValue: T): T
function getConf<T>(key: string, defaultValue?: T) {
  const config = workspace.getConfiguration('remote-snippets')
  return config.get(key, defaultValue)
}

export const remoteSnippets = () => getConf<SnippetConfig[]>('snippets', [])

export const remoteSnippetsConfigs = () => getConf<string[]>('config', [])

/**
 *
 * @returns js files
 */
export const localJSConfigs = () => getConf<string[]>('js', [])
