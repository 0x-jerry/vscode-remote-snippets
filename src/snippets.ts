import Ajv, { ValidateFunction } from 'ajv'
import axios, { AxiosProxyConfig } from 'axios'
import { workspace } from 'vscode'
import { getGlobalSnippetSchema } from './chore/get-snippet-schema'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { VscodeSchemasGlobalSnippets } from './types'

let validate: ValidateFunction

export async function isValidSnippet(snippet: Record<string, any>) {
  if (!validate) {
    const txt = await getGlobalSnippetSchema()
    const schema = JSON.parse(txt)

    schema.$id = schema.id
    delete schema.id

    const ajv = new Ajv({
      strict: false,
    })

    validate = ajv.compile(schema)
  }

  const isValid = validate(snippet)

  return isValid
}

function getProxy() {
  const conf = workspace.getConfiguration('http')
  const proxy = conf.get<string>('proxy')

  if (!proxy) {
    return false
  }

  // const url = new URL(proxy)

  // const proxyConf: AxiosProxyConfig = {
  //   host: url.hostname,
  //   port: parseInt(url.port) || 80,
  //   protocol: url.protocol,
  //   auth: url.username
  //     ? {
  //         username: url.username,
  //         password: url.password,
  //       }
  //     : undefined,
  // }

  return proxy
}

export async function fetchSnippet(
  url: string,
): Promise<false | VscodeSchemasGlobalSnippets> {
  try {
    const proxy = getProxy()
    const { data } = await axios.get(url, {
      proxy: false,
      httpsAgent: proxy ? new HttpsProxyAgent(proxy) : undefined,
    })

    if (!(await isValidSnippet(data))) {
      return false
    }

    return data
  } catch (error) {
    console.warn(error)
    return false
  }
}
