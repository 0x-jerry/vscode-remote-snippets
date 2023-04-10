# vscode-remote-snippets

Auto fetch snippets from remote and load it.

## Features

- Support remote snippets.
- Support local dynamic snippets, which can written in JS.

## Usage

You may need specify some snippets remote address, It supports a single snippet config, something like `https://raw.githubusercontent.com/hollowtree/vscode-vue-snippets/master/snippets/html.json`, it also supports snippets config, like `https://raw.githubusercontent.com/0x-jerry/snippets/main/package.json`. And the most excited feature, local dynamic snippets.

```json
{
  "remote-snippets.snippets": [
    {
      "path": "https://raw.githubusercontent.com/hollowtree/vscode-vue-snippets/master/snippets/html.json",
      "language": "vue,html"
    }
  ],
  "remote-snippets.config": [
    "https://raw.githubusercontent.com/0x-jerry/snippets/main/package.json"
  ],
  "remote-snippets.js": ["snippets/now.js"]
}
```

About how to use local dynamic snippets with `remote-snippets.js` configuration item, please see [example](./example).

About how to write snippet, please refer to https://code.visualstudio.com/docs/editor/userdefinedsnippets#_snippet-syntax.
