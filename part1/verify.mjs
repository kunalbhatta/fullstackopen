// Runtime verification for Full Stack Open Part 1 (used by GitHub Actions).
// Execute from part1/<app> after npm install and npm install --no-save jsdom.
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import Module from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const app = process.argv[2]
assert.ok(['courseinfo', 'unicafe', 'anecdotes'].includes(app), 'Expected app name')
const project = process.cwd()
assert.equal(path.basename(project), app, 'Run from the requested app directory')
const require = createRequire(pathToFileURL(path.join(project, 'package.json')))
const { JSDOM } = require('jsdom')
const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost:5173',
})
globalThis.window = dom.window
globalThis.document = dom.window.document
globalThis.navigator = dom.window.navigator
globalThis.HTMLElement = dom.window.HTMLElement
globalThis.MouseEvent = dom.window.MouseEvent
globalThis.IS_REACT_ACT_ENVIRONMENT = true

const React = require('react')
const { act } = require('react-dom/test-utils')
const { createRoot } = require('react-dom/client')
const esbuild = require('esbuild')
const compiled = await esbuild.build({
  entryPoints: [path.join(project, 'src/App.jsx')],
  bundle: true,
  write: false,
  platform: 'node',
  format: 'cjs',
  jsx: 'transform',
  jsxFactory: 'React.createElement',
  jsxFragment: 'React.Fragment',
  external: ['react'],
})
const filename = path.join(project, 'src/App.compiled.cjs')
const jsModule = new Module(filename)
jsModule.filename = filename
jsModule.paths = Module._nodeModulePaths(path.dirname(filename))
jsModule._compile(compiled.outputFiles[0].text, filename)
const App = jsModule.exports.default

const rootNode = document.getElementById('root')
const root = createRoot(rootNode)
await act(async () => root.render(React.createElement(App)))

function text() { return rootNode.textContent }
function btn(name) {
  const button = [...rootNode.querySelectorAll('button')].find(b => b.textContent.trim() === name)
  assert.ok(button, 'Button is present: ' + name)
  return button
}
async function click(name, n = 1) {
  for (let i = 0; i < n; i++) {
    await act(async () => btn(name).dispatchEvent(new window.MouseEvent('click', { bubbles: true })))
  }
}

if (app === 'courseinfo') {
  assert.equal(rootNode.querySelector('h1').textContent, 'Half Stack application development')
  for (const line of ['Fundamentals of React 10', 'Using props to pass data 7', 'State of a component 14', 'Number of exercises 31']) {
    assert.ok(text().includes(line), 'Courseinfo includes ' + line)
  }
  console.log('PASS courseinfo: header, three parts, correct sum')
}
if (app === 'unicafe') {
  assert.ok(text().includes('No feedback given'), 'Unicafe initial state')
  assert.equal(rootNode.querySelector('table'), null, 'No statistics table before feedback')
  await click('good', 2)
  await click('neutral', 1)
  await click('bad', 1)
  const rows = [...rootNode.querySelectorAll('tr')].map(row => [...row.querySelectorAll('td')].map(td => td.textContent.trim()))
  assert.deepEqual(rows, [
    ['good', '2'],
    ['neutral', '1'],
    ['bad', '1'],
    ['all', '4'],
    ['average', '0.25'],
    ['positive', '50 %'],
  ])
  console.log('PASS unicafe: initial empty state, buttons, counts, average, positive percentage, table rows')
}
if (app === 'anecdotes') {
  const first = rootNode.querySelectorAll('p')[0].textContent
  assert.ok(first.includes('If it hurts'), 'First anecdote')
  await click('vote', 2)
  assert.ok(text().includes('has 2 votes'), 'Vote count updates')
  const prevRandom = Math.random
  try {
    Math.random = () => 0.99
    await click('next anecdote')
  } finally { Math.random = prevRandom }
  assert.ok(rootNode.querySelectorAll('p')[0].textContent.includes('The only way to go fast'), 'Next anecdote changes selection')
  await click('vote')
  const paragraphs = [...rootNode.querySelectorAll('p')].map(el => el.textContent)
  assert.equal(paragraphs[0], 'The only way to go fast, is to go well.')
  assert.equal(paragraphs[1], 'has 1 votes')
  assert.equal(paragraphs[2], first, 'Most-voted anecdote stays the one with two votes')
  assert.equal(paragraphs[3], 'has 2 votes')
  console.log('PASS anecdotes: selection, votes tracked per anecdote, highest-voted display')
}
await act(async () => root.unmount())
dom.window.close()
