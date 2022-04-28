exports.default = {
  'Get ISO format date-time': {
    scope: 'javascript,typescript',
    prefix: 'now',
    body: () => new Date().toISOString(),
    description: 'Get the ISO format date-time',
  },
}
