import { defineConfig } from '@0x-jerry/x-release'

export default defineConfig({
  async beforeCommit(ctx) {
    await ctx.run('npm run changelog')
  }
})
