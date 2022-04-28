# vscode-remote-snippets

Auto fetch snippets from remote and load it.

## Usage

Just add some remote urls to config.

```json
{
  "remote-snippets.snippets": [
    {
      "path": "https://raw.githubusercontent.com/hollowtree/vscode-vue-snippets/master/snippets/html.json",
      "language": "vue"
    }
  ],
  "remote-snippets.config": [
    "https://raw.githubusercontent.com/0x-jerry/snippets/main/package.json",
  ],
  "remote-snippets.js": [
    "snippets/now.js"
  ],
}
```

About how to use dynamic snippets with `remote-snippets.js`, please see [example](./example).

Then this extension will fetch remote snippets and load it for you.

## How to write remote snippets

Please refer to: https://github.com/0x-jerry/snippets.
