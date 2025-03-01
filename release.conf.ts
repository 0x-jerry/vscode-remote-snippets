import { defineConfig } from '@0x-jerry/x-release'

export default defineConfig({
  publish: false,
  async beforeCommit(ctx) {
    await ctx.run('npm run changelog')
  },
  tasks: [
    //
    (ctx) => ctx.run('npm run publish'),
  ],
})
