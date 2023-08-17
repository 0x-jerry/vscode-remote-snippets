export default {
  'Get ISO format date-time': {
    scope: 'javascript,typescript',
    prefix: 'now',
    body: (opt) => {
      return [new Date().toISOString(), opt.file, opt.text]
    },
    description: 'Get the ISO format date-time',
  },
}
