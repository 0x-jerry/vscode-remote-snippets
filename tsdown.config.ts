import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/extension.ts'],
  format: ['esm'],
  platform: 'node',
  fixedExtension: false,
  clean: true,
  sourcemap: true,
  deps: {
    neverBundle: ['vscode'],
    onlyBundle: false,
  },
})
