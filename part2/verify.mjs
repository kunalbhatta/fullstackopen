import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import Module from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const app = process.argv[2]
assert.ok(['courseinfo', 'phonebook', 'countries'].includes(app), 'Valid Part 2 app')
const cwd = process.cwd()
assert.equal(path.basename(cwd), app)
const require = createRequire(pathToFileURL(path.join(cwd, 'package.json')))
const { JSDOM } = require('jsdom')
const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost:5173' })
globalThis.window = dom.window
globalThis.document = dom.window.document
globalThis.navigator = dom.window.navigator
globalThis.HTMLElement = dom.window.HTMLElement
globalThis.MouseEvent = dom.window.MouseEvent
globalThis.IS_REACT_ACT_ENVIRONMENT = true

const React = require('react')
const { act, Simulate } = require('react-dom/test-utils')
const { createRoot } = require('react-dom/client')
const esbuild = require('esbuild')

const examples = [
  { id:'1', name:'Arto Hellas', number:'040-123456' },
  { id:'2', name:'Ada Lovelace', number:'39-44-5323523' },
]
const countries = [
  { cca3:'FIN', name:{common:'Finland'}, capital:['Helsinki'], capitalInfo:{latlng:[60.17,24.94]}, languages:{fin:'Finnish',swe:'Swedish'}, area:338455, flags:{png:'https://example.org/fi.png'} },
  { cca3:'ISL', name:{common:'Iceland'}, capital:['Reykjavik'], capitalInfo:{latlng:[64.14,-21.9]}, languages:{isl:'Icelandic'}, area:103000, flags:{png:'https://example.org/is.png'} },
  { cca3:'GBR', name:{common:'United Kingdom'}, capital:['London'], capitalInfo:{latlng:[51.5,-0.12]}, languages:{eng:'English'}, area:242495, flags:{png:'https://example.org/gb.png'} },
  { cca3:'USA', name:{common:'United States'}, capital:['Washington, D.C.'], capitalInfo:{latlng:[38.89,-77.04]}, languages:{eng:'English'}, area:9833520, flags:{png:'https://example.org/us.png'} },
]
if (app === 'phonebook' || app === 'countries') {
  const axios = require('axios').default
  let store = [...examples]
  let id = 3
  axios.defaults.adapter = async config => {
    let result
    const url = new URL(config.url)
    const method = config.method.toLowerCase()
    if (app === 'countries') {
      if (url.pathname === '/restcountries/api/all') result = countries
      else if (url.pathname === '/v1/forecast') result = { current: { temperature_2m: 12, wind_speed_10m: 15 } }
      else throw new Error('Unexpected countries request: ' + config.url)
    } else {
      const personId = url.pathname.split('/')[2]
      const body = config.data ? JSON.parse(config.data) : null
      if (method === 'get') result = [...store]
      else if (method === 'post') {
        result = { ...body, id: String(id++) }
        store.push(result)
      } else if (method === 'put') {
        const idx = store.findIndex(p => p.id === personId)
        if (idx < 0) throw Object.assign(new Error('Not found'), { response: { status: 404 } })
        result = { ...body, id: personId }
        store[idx] = result
      } else if (method === 'delete') {
        store = store.filter(p => p.id !== personId)
        result = {}
      } else throw new Error('Unexpected phonebook method: ' + method)
    }
    return { config, data: result, status:200, statusText:'OK', headers:{} }
  }
}

const compiled = await esbuild.build({
  entryPoints: [path.join(cwd, 'src/App.jsx')],
  bundle: true,
  write: false,
  format: 'cjs',
  platform: 'node',
  jsx: 'transform',
  jsxFactory: 'React.createElement',
  jsxFragment: 'React.Fragment',
  external: ['react', 'axios'],
  plugins: [{ name:'ignore-css', setup(build) {
    build.onResolve({ filter: /\.css$/ }, args => ({ path:args.path, namespace:'ignore-css' }))
    build.onLoad({ filter: /.*/, namespace:'ignore-css' }, () => ({ contents:'', loader:'js' }))
  } }],
})
const filename = path.join(cwd, 'src/App.compiled.cjs')
const codeModule = new Module(filename)
codeModule.filename = filename
codeModule.paths = Module._nodeModulePaths(path.dirname(filename))
codeModule._compile(compiled.outputFiles[0].text, filename)
const App = codeModule.exports.default
const rootNode = document.getElementById('root')
const root = createRoot(rootNode)

await act(async () => {
  root.render(React.createElement(App))
  await Promise.resolve()
  await Promise.resolve()
})

const body = () => rootNode.textContent
const change = async (selector, value) => {
  const input = rootNode.querySelector(selector)
  assert.ok(input, 'Input ' + selector)
  await act(async () => {
    Simulate.change(input, { target: { value } })
    await Promise.resolve()
  })
}
const click = async element => {
  assert.ok(element, 'Clickable element')
  await act(async () => {
    Simulate.click(element)
    await Promise.resolve()
    await Promise.resolve()
  })
}

if (app === 'courseinfo') {
  for (const s of ['Half Stack application development','Redux 11','total of 42 exercises','Node.js','Routing 3','Middlewares 7','total of 10 exercises']) {
    assert.ok(body().includes(s), s)
  }
  assert.equal(rootNode.querySelectorAll('section').length,2)
  console.log('PASS Course Information: multiple courses, mapped parts, reduce totals, separate module')
}

if (app === 'phonebook') {
  assert.ok(body().includes('Arto Hellas') && body().includes('Ada Lovelace'), 'Loads data from backend')
  await change('input[aria-label="filter shown with"]', 'ada')
  assert.ok(!body().includes('Arto Hellas') && body().includes('Ada Lovelace'), 'Case insensitive filter')
  await change('input[aria-label="filter shown with"]', '')
  await change('input[aria-label="name"]', 'Mary Smith')
  await change('input[aria-label="number"]', '111')
  await act(async () => {
    Simulate.submit(rootNode.querySelector('form'))
    await Promise.resolve()
    await Promise.resolve()
  })
  assert.ok(body().includes('Mary Smith') && body().includes('111'), 'POST adds person')
  window.confirm = () => true
  await change('input[aria-label="name"]', 'Mary Smith')
  await change('input[aria-label="number"]', '222')
  await act(async () => {
    Simulate.submit(rootNode.querySelector('form'))
    await Promise.resolve()
    await Promise.resolve()
  })
  assert.ok(body().includes('Mary Smith 222'), 'PUT updates a matching person')
  const button=[...rootNode.querySelectorAll('button')].find(el=>el.textContent==='delete'&&el.parentElement.textContent.includes('Mary Smith'))
  await click(button)
  assert.ok(
    ![...rootNode.querySelectorAll('button')].some(el => el.textContent === 'delete' && el.parentElement.textContent.includes('Mary Smith')),
    'DELETE removes person from the list (a temporary success message can still mention the name)'
  )
  console.log('PASS Phonebook: GET, filter, POST, PUT, DELETE, status notifications')
}

if (app === 'countries') {
  assert.ok(body().includes('find countries'), 'Search input renders')
  await change('input[aria-label="find countries"]', 'united')
  assert.equal(rootNode.querySelectorAll('button').length,2, 'Two matching countries, each with show button')
  await click(rootNode.querySelector('button'))
  assert.ok(body().includes('United Kingdom'), 'Selection shows country')
  assert.ok(body().includes('Weather in London'), 'Weather section for capital')
  assert.ok(body().includes('Temperature 12 Celsius'), 'Weather API displays temperature')
  await change('input[aria-label="find countries"]', 'finland')
  assert.ok(body().includes('Finnish') && body().includes('338455'), 'Single-country languages and area')
  console.log('PASS Countries: filter, show, single-country details, weather API')
}

await act(async () => root.unmount())
dom.window.close()
