module.exports = {
  port: 8080,
  watch: true,
  appIndex: 'index.html',
  rootDir: 'dist/',
  middlewares: [
    (context, next) => {
      if (/(\/projects)|(\/contact)/.test(context.url)) {
        context.url = `${context.url}.html`
      }
      return next()
    }
  ],
}
