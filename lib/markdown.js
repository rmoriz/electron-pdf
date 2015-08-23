var marked = require('marked')
var fs = require('fs')
var os = require('os')
var path = require('path')
var uuid = require('time-uuid')
var highlightjs = require('highlight.js')

/**
 * parse the markdown content and write it to system tmp directory
 * @param  {String} input Path of the markdown file
 * @param  {Object} options Markdown parser options
 * @return {Function}         The callback function with HTML path
 */
module.exports = function (input, options, cb) {

  if (options instanceof Function) {
    cb = options
    options = {}
  }

  marked.setOptions({
    renderer: options.renderer || new marked.Renderer(),
    gfm: options.gfm || true,
    tables: options.tables || true,
    breaks: options.breaks || false,
    pedantic: options.pedantic || false,
    sanitize: options.sanitize || true,
    smartLists: options.smartLists || true,
    smartypants: options.smartypants || false,
    highlight: function (code, lang) {
      return highlightjs.highlightAuto(code, [ lang ]).value
    }
  })

  fs.readFile(input, function (err, markdownContent) {
    if (err) {
      cb(err)
    }

    var htmlBody = marked(markdownContent.toString())
    var githubMarkdownCssPath = 'node_modules/github-markdown-css/github-markdown.css'
    var highlightjsDefaultCssPath = 'node_modules/highlight.js/styles/default.css'
    var highlightjsGithubCssPath = 'node_modules/highlight.js/styles/github.css'

    var htmlHeader = '<link rel="stylesheet" href="' + path.resolve(githubMarkdownCssPath) + '">' +
      '<link rel="stylesheet" href="' + path.resolve(highlightjsDefaultCssPath) + '">' +
      '<link rel="stylesheet" href="' + path.resolve(highlightjsGithubCssPath) + '">' +
      '<style> .markdown-body { min-width: 200px; max-width: 790px; margin: 0 auto; padding: 30px; } </style>' +
      '<article class="markdown-body">\n'

    var htmlFooter = '\n </article>'

    var htmlContent = htmlHeader + htmlBody + htmlFooter

    var tmpHTMLPath = path.join(os.tmpdir(), path.parse(input).name + '-' + uuid() + '.html')

    fs.writeFile(tmpHTMLPath, htmlContent, function (err) {
      if (err) {
        cb(err)
      }

      cb(null, tmpHTMLPath)
    })
  })

}