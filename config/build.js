const fs = require('fs')
const path = require('path')
const ejs = require('ejs')

const publicPath = path.join(process.cwd(), 'dist')
const srcPath = path.join(process.cwd(), 'src')

/* NOTE: Important! Order of files matters */
const files = [
  'index.ejs',
  'projects.ejs',
  'contact.ejs',
]

const readHTMLFile = (filePath) => {
  return new Promise((resolve, reject) => fs.readFile(filePath, (err, value) => {
    if (err) {
      return reject(err)
    }
    resolve(value)
  }))
}

const writeHTMLFile = (filePath, fileContent) => {
  return new Promise((resolve, reject) => fs.writeFile(filePath, fileContent, (err, value) => {
    if (err) {
      return reject(err)
    }
    resolve(value)
  }))
}

const buildTemplate = async (filePath) => {
  const content = await readHTMLFile(path.join(srcPath, filePath))
  const rendered = ejs.render(content.toString(), {
    rootPath: srcPath,
  })
  const segments = filePath.split('/')
  const outPath = path.parse(segments[segments.length - 1])
  await writeHTMLFile(path.join(publicPath, `${outPath.name}.html`), rendered)
}

const buildHTML = async (templates) => {
  try {
    await Promise.all(templates.map(buildTemplate))
    process.exit(0)
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

buildHTML(files)
