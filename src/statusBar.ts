import { StatusBarAlignment, window } from 'vscode'
import { Commands } from './const'

const instance = window.createStatusBarItem(StatusBarAlignment.Right, 1000)

export const statusBar = {
  instance: instance,
  reset() {
    instance.text = 'Snippets $(sync)'
    instance.tooltip = 'Click to refresh'
    instance.command = Commands.Refresh
    instance.show()
  },

  loading() {
    instance.text = 'Snippets $(sync~spin)'
    instance.tooltip = 'Syncing from remote'
    instance.command = undefined
  },

  updateProgress(current: number, total: number) {
    instance.text = `Snippets ${current} / ${total} $(sync~spin)`
    instance.tooltip = 'Syncing from remote'
    instance.command = undefined

    if (current === total) {
      statusBar.reset()
    }
  },
}
