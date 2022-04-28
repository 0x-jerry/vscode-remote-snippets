exports.default = {
  'Get datetime': {
    scope: 'javascript,typescript',
    prefix: 'now',
    body: () => new Date().toISOString(),
    description: 'Log output to console',
  },
}
