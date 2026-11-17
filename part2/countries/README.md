# Countries — Full Stack Open Part 2 (exercises 2.18–2.20)

```bash
npm install
npm run dev
```

The app fetches the [University of Helsinki REST Countries proxy](https://studies.cs.helsinki.fi/restcountries/api/all).

- Enter "fin": the app shows a matching country and its flag, languages, capital and area.
- Enter "united": the app shows several results; click **show** on one of them.
- Enter "a": the app requests a more specific filter.
- On a country's detail page, the current temperature and wind speed of its capital are fetched from [Open-Meteo](https://open-meteo.com/en/docs). It requires no API key for this non-commercial educational use.

If you leave the search field empty, country results are hidden until you type something.
