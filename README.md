# Messaging App

A Discord-like Messaging App built with a REST API backend

<img width="750" src="./examples/example.gif" alt="showcase of the app" />

## Features
It includes **authorization** with Passport JWT, **sending messages** to other users through a POST request and then stored in a PostgreSQL database, **customizing** a user profile, specifically the username and about me, and a **friends system** for sending and accepting/refusing a friend request, and blocking another user.


## Quick Start

1. Navigate to [messaging-v.pages.dev](https://messaging-v.pages.dev/) and sign up!
2. Start chatting with any of the users!

## Steps

1. Clone the repository:

```bash
git clone https://github.com/sp41414/messaging-app
```

2. Install dependencies in both directories:

```bash
pnpm install
```

3. Fill out the `.env.template` and move it to `.env` in both directories

4. In the backend directory, run:

```bash
pnpm prisma:generate
pnpm prisma:migrate
```

5. Start your app by running in both directories:

```bash
pnpm dev
```
