import React, { useEffect, useState } from 'react'
import axios from 'axios'

const COUNTRY_URL = 'https://studies.cs.helsinki.fi/restcountries/api/all'
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast'

const Weather = ({ country }) => {
  const [weather, setWeather] = useState(null)
  const [error, setError] = useState('')

  const capital = country.capital?.[0]
  // The country API supplies the capital's coordinates, not only the country's center.
  const [latitude, longitude] = country.capitalInfo?.latlng || []

  useEffect(() => {
    setWeather(null)
    setError('')

    if (!capital || latitude == null || longitude == null) return

    let active = true
    axios.get(WEATHER_URL, {
      params: {
        latitude,
        longitude,
        current: 'temperature_2m,wind_speed_10m,weather_code',
      },
    })
      .then(response => {
        if (active) setWeather(response.data.current)
      })
      .catch(() => {
        if (active) setError('Weather information is unavailable')
      })

    return () => { active = false }
  }, [capital, latitude, longitude])

  if (!capital) return <p>Weather unavailable: no listed capital.</p>
  if (latitude == null || longitude == null) return <p>Weather unavailable: no coordinates for the capital.</p>

  return (
    <section>
      <h2>Weather in {capital}</h2>
      {error && <p role="alert">{error}</p>}
      {!error && !weather && <p>Loading weather...</p>}
      {weather && (
        <>
          <p>Temperature {weather.temperature_2m} Celsius</p>
          <p>Wind {weather.wind_speed_10m} km/h</p>
        </>
      )}
    </section>
  )
}

const Country = ({ country }) => {
  const languages = Object.values(country.languages || {})
  return (
    <section>
      <h1>{country.name.common}</h1>
      <p>capital {country.capital?.join(', ') || 'Not available'}</p>
      <p>area {country.area}</p>
      <h3>languages:</h3>
      <ul>{languages.map(language => <li key={language}>{language}</li>)}</ul>
      {country.flags?.png && <img src={country.flags.png} alt={country.flags.alt || `Flag of ${country.name.common}`} width="180" />}
      <Weather country={country} />
    </section>
  )
}

const Countries = ({ countries, onShow }) => {
  if (countries.length > 10) return <p>Too many matches, specify another filter</p>
  if (countries.length === 0) return <p>No matching countries</p>
  if (countries.length === 1) return <Country country={countries[0]} />

  return (
    <div>
      {countries.map(country => (
        <div key={country.cca3}>
          {country.name.common}{' '}
          <button type="button" onClick={() => onShow(country)}>show</button>
        </div>
      ))}
    </div>
  )
}

const App = () => {
  const [allCountries, setAllCountries] = useState([])
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    axios.get(COUNTRY_URL)
      .then(response => setAllCountries(response.data))
      .catch(() => setError('Could not load countries'))
  }, [])

  const matching = allCountries.filter(country =>
    country.name.common.toLowerCase().includes(query.toLowerCase())
  )

  const shownCountries = selected ? [selected] : matching

  const changeQuery = event => {
    setQuery(event.target.value)
    setSelected(null)
  }

  return (
    <div>
      <div>find countries <input aria-label="find countries" value={query} onChange={changeQuery} /></div>
      {error && <p role="alert">{error}</p>}
      {!error && allCountries.length === 0 && <p>Loading countries...</p>}
      {!error && allCountries.length > 0 && query.trim() !== '' && (
        <Countries countries={shownCountries} onShow={setSelected} />
      )}
    </div>
  )
}

export default App
