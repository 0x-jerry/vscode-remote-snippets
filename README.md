# vscode-remote-snippets

Auto fetch snippets from remote and load it.

## Usage

Just add some remote urls to config.

```json
{
  "remote-snippets.snippets": [
    {
      "url": "https://raw.githubusercontent.com/hollowtree/vscode-vue-snippets/master/snippets/html.json",
      "language": "vue"
    }
  ],
  "remote-snippets.config": [
    "https://raw.githubusercontent.com/0x-jerry/snippets/main/snippets-config.json"
  ]
}
```

Then this extension will fetch remote snippets and load it for you.

## How to write remote snippets

Please refer to: https://github.com/0x-jerry/snippets.
