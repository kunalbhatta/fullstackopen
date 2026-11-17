# Part 3 Phonebook

The Express server serves the production build of the [Part 2 React Phonebook](../part2/phonebook) and stores contacts in MongoDB. The Part 2 app still supports its original JSON Server setup.

## Run locally

Use Node.js 22.13 or newer. Create a MongoDB Atlas database or start a local MongoDB server. From the repository root, run:

```bash
cd part3
npm ci
cp .env.example .env
```

Set `MONGODB_URI` in `part3/.env` to your connection string. For Atlas, use the Drivers connection string and set the database name to `phonebook`. Add your local IP address to the Atlas project's Network Access list. The example URI works with a local MongoDB server on port 27017.

```bash
npm run build
npm start
```

Open [the Phonebook](http://localhost:3001/), [the JSON API](http://localhost:3001/api/persons), or [the entry count and current time](http://localhost:3001/info). The database starts empty. Add a sample contact in the browser or with:

```bash
npm run db -- "" "Ada Lovelace" "09-1234556"
npm run db
```

The empty argument uses the password already configured in `MONGODB_URI`. For the course's password-first syntax, run `node --env-file-if-exists=.env mongo.js yourpassword` to list contacts, or append the quoted name and number to add one.

For live reload, run `npm run dev` from `part3` and `npm run dev -- --mode part3` from `part2/phonebook` in a second terminal. Open the Vite URL printed in that terminal. Run `npm run lint` from `part3` to check the server code.

## Deploy on Render

1. Create a Node **Web Service** pointing to this GitHub repository and choose the **Free** instance. Keep **Root Directory** blank so the build can read both part folders.
2. Set **Build Command** to `npm --prefix part3 ci --omit=dev && npm --prefix part3 run build`.
3. Set **Start Command** to `npm --prefix part3 start`. Add `MONGODB_URI` under Environment and allow the service's outbound IP ranges in Atlas Network Access.
4. Verify the public homepage, `/api/persons`, and adding, updating, and deleting a sample contact. Add the public app URL to the [root README](../README.md).

Use sample contacts on the public deployment. Keep `.env` and database credentials out of GitHub.
