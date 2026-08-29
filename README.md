# 🚀 Next.js Supabase Starter

A production ready open source starter kit for building modern SaaS apps with Next.js TypeScript Tailwind CSS and Supabase. Built to be simple enough for your first pull request and solid enough to actually ship a real product on top of.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ecf8e)
![License](https://img.shields.io/badge/license-MIT-green)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)

## Screenshots

| Light Mode | Dark Mode |
|---|---|
| ![Homepage Light](./screenshots/homepage-light.png) | ![Homepage Dark](./screenshots/homepage-dark.png) |

| Login | Sign up |
|---|---|
| ![Login](./screenshots/login.png) | ![Sign up](./screenshots/signup.png) |

## Why this starter

Most starter kits fall into one of two camps. Either they are toy examples that fall apart the moment you try to build something real or they are bloated paid templates locked behind a paywall. This project sits in the middle. It ships with real authentication a real Postgres database and a working dashboard while staying small enough to read through in one sitting.

It is also built with open source contribution in mind. The codebase is intentionally kept clean and well organized so that a beginner writing their first pull request and a senior engineer looking for a weekend project can both work in it comfortably.

## Tech stack

- [Next.js 14](https://nextjs.org/) using the App Router
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) for authentication and the Postgres database
- [Stripe](https://stripe.com/) for billing and subscriptions
- [Vitest](https://vitest.dev/) and [Testing Library](https://testing-library.com/) for unit tests
- [Storybook](https://storybook.js.org/) for isolated component development

## Features

- Email and password authentication through Supabase Auth
- Google OAuth login
- Protected dashboard route with a live user profile card
- User profile page with avatar upload (Supabase Storage)
- Stripe billing example (pricing page, Checkout, webhook)
- Password reset flow
- Dark mode toggle with saved preference
- Built in internationalization with English and Urdu support
- Responsive navbar and footer
- Unit test suite covering core components
- Storybook setup for building and previewing UI in isolation
- GitHub Actions CI that lints every pull request
- Clean and predictable folder structure that is easy to extend

## Getting started

Clone the repository and install the dependencies.

```bash
git clone https://github.com/MuhammadNiazAli/nextjs-supabase-starter.git
cd nextjs-supabase-starter
npm install
```

Copy the example environment file and fill in your own Supabase credentials.

```bash
cp .env.example .env.local
```

Start the development server.

```bash
npm run dev
```

The app will be running at [http://localhost:3000](http://localhost:3000).

## Supabase setup

1. Create a free project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key into `.env.local`
3. Open the Supabase SQL editor and run the contents of `supabase/schema.sql` to create the required tables, the `avatars` storage bucket, and all row level security policies
4. If you plan to use Google login enable the Google provider from the Supabase Auth settings

## Stripe setup (optional)

The pricing page, checkout, and webhook are opt-in — the app runs fine without Stripe configured.

1. Create a [Stripe](https://stripe.com) account and a recurring Price for your plan
2. Add `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PRICE_ID` to `.env.local`
3. Add `SUPABASE_SERVICE_ROLE_KEY` (Project Settings → API in Supabase) — needed by the webhook to write subscription status
4. Forward webhooks locally with the [Stripe CLI](https://stripe.com/docs/stripe-cli): `stripe listen --forward-to localhost:3000/api/webhooks/stripe`, then copy the printed signing secret into `STRIPE_WEBHOOK_SECRET`
5. In production, add a webhook endpoint in the Stripe Dashboard pointing at `https://your-domain.com/api/webhooks/stripe`, listening for `checkout.session.completed`, `customer.subscription.updated`, and `customer.subscription.deleted`

## Available scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts the app in development mode |
| `npm run build` | Builds the app for production |
| `npm run start` | Runs the production build |
| `npm run lint` | Lints the codebase |
| `npm run format` | Formats the codebase with Prettier |
| `npm test` | Runs the unit test suite |
| `npm run storybook` | Starts Storybook for component development |

## Project structure

```
src/
  app/            App Router pages including auth dashboard profile pricing and API routes
  components/     Reusable UI components and their tests and stories
  lib/            Supabase client, Supabase admin client, Stripe client, and internationalization logic
  messages/       Translation files for each supported language
  stories/        Storybook design system assets
supabase/
  schema.sql      Database schema, storage policies, and row level security policies
```

## Contributing

This project is built for the community and every contribution is welcome no matter how small. Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.

If you are new to open source start with an issue labeled [good first issue](../../issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22). If you are looking for something more involved check the issues labeled [help wanted](../../issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22).

There are many ways to contribute beyond writing code.

- Star the repo so more people can discover it
- Fork it and use it as a base for your own project
- Report bugs through the Issues tab
- Suggest new features
- Review open pull requests
- Improve the documentation

## Roadmap

- [x] Google OAuth login
- [x] Unit tests with Vitest
- [x] i18n support with English and Urdu
- [x] Storybook setup for components
- [x] Stripe billing example
- [x] User profile page with avatar upload
- [ ] GitHub OAuth login
- [ ] Rate limiting on API routes
- [ ] Accessibility audit

Browse the [open issues](../../issues) for the full and up to date list of what is being worked on.

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details. You are free to use it for personal or commercial projects.

## Maintainer

Built and maintained by [Muhammad Niaz Ali](https://github.com/MuhammadNiazAli) full stack developer working across Next.js React Native Supabase and Python automation with n8n.

If this project saved you time please consider giving it a star. It genuinely helps more contributors find the repo.
