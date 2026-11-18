const { expect, test } = require('@playwright/test')

const roster = ['bulbasaur', 'ivysaur', 'venusaur']
const list = { results: roster.map((name, index) => ({
  name, url: `https://pokeapi.co/api/v2/pokemon/${index + 1}/`,
})) }

test.beforeEach(async ({ page }) => {
  await page.route('https://pokeapi.co/api/v2/pokemon/**', route => {
    const { pathname } = new URL(route.request().url())
    const name = pathname.split('/').filter(Boolean).pop()
    if (name === 'pokemon') return route.fulfill({ json: list })

    return route.fulfill({ json: {
      name,
      types: [{ slot: 1, type: { name: 'grass' } }],
      stats: [{ stat: { name: 'attack' }, base_stat: 49 }],
      abilities: [{ ability: { name: 'overgrow' }, is_hidden: false }],
      sprites: { front_default: null },
    } })
  })
})

test('home lists Pokémon and links to details', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('link', { name: 'bulbasaur' })).toBeVisible()
  await page.getByRole('link', { name: 'bulbasaur' }).click()
  await expect(page).toHaveURL('/pokemon/bulbasaur')
  await expect(page.getByText('overgrow')).toBeVisible()
  await expect(page.getByText('49')).toBeVisible()
})

test('opening a detail URL directly supports previous and next navigation', async ({ page }) => {
  await page.goto('/pokemon/ivysaur')
  await expect(page.getByRole('link', { name: 'Previous' })).toHaveAttribute('href', '/pokemon/bulbasaur')
  await expect(page.getByRole('link', { name: 'Next' })).toHaveAttribute('href', '/pokemon/venusaur')
  await page.getByRole('link', { name: 'Next' }).click()
  await expect(page).toHaveURL('/pokemon/venusaur')
})
