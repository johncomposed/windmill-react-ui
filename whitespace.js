const diff = require('diff')
const glob = require('glob')
const fs = require('fs')
const fse = require('fs-extra')
const path = require('path')

const validPath = (file, exts = ['.ts', '.tsx']) => {
  const f = path.extname(file) ? file.replace(path.extname(file), '') : file
  const valid = exts.find((ex) => fs.existsSync(f + ex))
  if (valid) return f + valid
  console.log('ERR - none found')
  return file
}

function applyWhitespace(oldText, newText) {
  const patch = diff.parsePatch(diff.createPatch('file', oldText, newText, '', ''))

  const hunks = patch[0].hunks
  for (let i = 0; i < hunks.length; ++i) {
    let lineOffset = 0
    const hunk = hunks[i]
    hunk.lines = hunk.lines.map((line) => {
      if (line === '-') {
        lineOffset++
        return ' '
      }
      return line
    })
    hunk.newLines += lineOffset
    for (let j = i + 1; j < hunks.length; ++j) {
      hunks[j].newStart += lineOffset
    }
  }
  return diff.applyPatch(oldText, patch)
}

const prefix = './dist1/'
const newdir = './dist1x/'

glob(`${prefix}**/*.js*`, {}, function (er, files) {
  if (er) {
    console.log('ERR', er)
    return
  }

  files.forEach((f) => {
    console.log(f, f.replace(prefix, './src/').replace('js', 'ts'))
    const js = fs.readFileSync(f, 'utf8')
    const src = validPath(f.replace(prefix, './src/'))
    const ts = fs.readFileSync(src, 'utf8')
    const w = applyWhitespace(ts, js)
      .replace(/\/\*\*\n\s+\* (.*)?\n\s+\*\//gm, '/* $1 */')
      .replace(/^(.*)?\.propTypes/gm, '\n$1.propTypes')
      .replace(/_pt/gm, 'PT')

    console.log(js.split('\n').length, ts.split('\n').length, w.split('\n').length)

    fse.outputFileSync(f.replace(prefix, newdir) + (src.endsWith('x') ? 'x' : ''), w)
  })
})
