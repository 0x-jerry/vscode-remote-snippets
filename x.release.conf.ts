import { defineConfig } from '@0x-jerry/x-release'

export default defineConfig({
  sequence: [
    "pkg.update.version",
    "npm:changelog",
    "git.commit",
    "git.tag",
    "git.push",
    "npm:publish"
  ]
})
