const diff = require('diff')
const glob = require('glob')
const fs = require('fs')
const fse = require('fs-extra')

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

const prefix = './dist3/'
const newdir = './dist3x/'

glob(`${prefix}**/*.js*`, {}, function (er, files) {
  if (er) {
    console.log('ERR', er)
    return
  }

  files.forEach((f) => {
    console.log(f, f.replace(prefix, './src/').replace('js', 'ts'))
    const js = fs.readFileSync(f, 'utf8')
    const ts = fs.readFileSync(f.replace(prefix, './src/').replace('js', 'ts'), 'utf8')
    const w = applyWhitespace(ts, js)

    console.log(js.split('\n').length, ts.split('\n').length, w.split('\n').length)

    fse.outputFileSync(f.replace(prefix, newdir), w)
  })
})
