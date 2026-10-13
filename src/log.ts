import { window } from 'vscode'

export const log = window.createOutputChannel('Remote Snippets', { log: true })
