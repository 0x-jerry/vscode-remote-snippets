import { defineConfig } from '@0x-jerry/x-release'

export default defineConfig({
  sequence: [
    "pkg.update.version",
    "npm:changelog",
    "git.tag",
    "git.commit",
    "git.push",
    "npm:publish"
  ]
})
