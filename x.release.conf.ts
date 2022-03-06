import { defineConfig } from '@0x-jerry/x-release'

export default defineConfig({
  sequence: [
    "git.tag",
    "npm:changelog",
    "git.commit",
    "git.push",
    "npm:publish"
  ]
})
