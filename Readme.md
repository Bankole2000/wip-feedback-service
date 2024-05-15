# Informanus Feedback Service

## How to run on local system

clone the repository

```sh
git clone https://gitlab.com/informanus-backend-apps/informanus-client-service.git 'feedback-service'
```

navigate to the folder

```sh
cd feedback-service
```

install packages

```sh
npm install
```

create `.env` file

```sh
touch .env
```

Add Environment variables

```sh
# postgres connection url
# e.g. "postgresql://myname:mypassword@localhost:5432/informanus?schema=public"
DATABASE_URL="postgresql://<username>:<password>@<host>:<port>/<database>?schema=public"
PORT="5008" # Port number
```

Run migrations to database

```sh
npx prisma migrate deploy
```

Start the server in dev mode

```sh
npm run dev
```

_or_ Start the server prod build

```sh
npm run build && npm start
```

## How to deploy using Railway CLI

Install the railway cli

```sh
npm i -g @railway/cli
```

Log in to railway

```sh
railway login
```

Create a new project or link to an existing project

```sh
# create new project
railway init

✔ Create new Project
✔ Enter project name: informanus
✔ Environment: production
🎉 Created project informanus
```

or link to an existing project on railway

```sh
# link to an existing project on railway
railway link
# select the project
```

Provision PostgreSQL

```sh
# add a plugin to the railway project
railway add

# select PostgreSQL
✔ Plugin: postgresql 
🎉 Created plugin postgresql
```

Link the repo to a service

```sh
railway service
```

Add railway postgrest url to `.env` file

```sh
echo DATABASE_URL=`railway variables get DATABASE_URL` > .env
```

Run locally with railway environment variables

```sh
railway run npm dev
```

or deploy to railway

```sh
# show build logs
railway up

# or return immediately after uploading
railway up --detach
```

TODOS

- creation of surveys by coaches
- adding of questions to surveys
- reviews/etc etc
