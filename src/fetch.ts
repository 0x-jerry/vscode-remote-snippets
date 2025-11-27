import { homedir } from 'node:os'
import { join } from 'node:path'
import axios from 'axios'
import debounce from 'debounce'
import fs from 'fs-extra'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { workspace } from 'vscode'
import { md5 } from './utils'

function getProxy() {
  const conf = workspace.getConfiguration('http')
  const proxy = conf.get<string>('proxy')

  if (!proxy) {
    return false
  }

  return proxy
}

const cachePath = join(homedir(), '.vscode-remote-snippets')

class Cache {
  confPath = join(cachePath, 'config.json')

  /**
   * url => md5(url)
   */
  conf!: Record<string, string>

  async load() {
    await fs.ensureDir(cachePath)

    if (!this.conf) {
      this.conf = {}

      try {
        this.conf = await fs.readJson(this.confPath)
      } catch (_error) {
        this.conf = {}
      }
    }

    this.save()
    return this.conf
  }

  save = debounce(() => this.saveSync(), 200)

  saveSync() {
    fs.writeFileSync(this.confPath, JSON.stringify(this.conf))
  }

  has(url: string) {
    return !!this.conf[url]
  }

  async get(url: string) {
    const hash = this.conf[url]
    if (!hash) {
      return
    }

    const p = join(cachePath, hash)
    if (!(await fs.pathExists(p))) {
      return
    }

    const res = await fs.readJSON(p)

    return res
  }

  async set(url: string, value: string) {
    if (this.conf[url]) {
      const p = join(cachePath, this.conf[url])
      if (await fs.pathExists(p)) {
        await fs.unlink(p)
      }
    }

    const hash = md5(value)

    this.conf[url] = hash

    await fs.writeFile(join(cachePath, hash), value)
    this.save()
  }

  async clear() {
    this.conf = {}
    await fs.emptyDir(cachePath)
  }
}

export const apiCache = new Cache()

export async function fetchJson<T = any>(
  url: string,
  cache = true,
): Promise<T> {
  const proxy = getProxy()

  if (cache && apiCache.has(url)) {
    const data = await apiCache.get(url)

    return data
  }

  const { data } = await axios.get(url, {
    proxy: false,
    httpsAgent: proxy ? new HttpsProxyAgent(proxy) : undefined,
  })

  apiCache.set(url, JSON.stringify(data))

  return data
}
