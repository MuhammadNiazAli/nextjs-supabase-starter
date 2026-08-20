# 🚀 Next.js Supabase Starter — TypeScript + Tailwind

A **production-ready, beginner-friendly, senior-approved** open-source starter kit for building modern SaaS apps fast.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ecf8e)
![License](https://img.shields.io/badge/license-MIT-green)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)

## 📸 Screenshots

| Light Mode | Dark Mode |
|---|---|
| ![Homepage Light](./screenshots/homepage-light.png) | ![Homepage Dark](./screenshots/homepage-dark.png) |

| Login | Sign up |
|---|---|
| ![Login](./screenshots/login.png) | ![Sign up](./screenshots/signup.png) |

## ✨ Why this repo?

Most starter kits are either too basic (toy examples) or too bloated (locked-in paid templates). This one aims for the middle: **real auth, real database, real dashboard — clean enough to learn from, solid enough to ship.**

Whether you're writing your first PR ever or you're a 10-year senior looking for a well-scoped repo to contribute to on weekends — there's something here for you.

## 🧱 Tech Stack

- [Next.js 14](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) (Auth + Postgres DB)

## 📦 Features

- Email/password authentication (Supabase Auth)
- Google OAuth login (Supabase Auth)
- Unit tests with Vitest + Testing Library (`npm test`)
- Protected dashboard route
- User profile page with avatar upload (Supabase Storage)
- Stripe billing example (pricing page, Checkout, webhook)
- Dark mode toggle
- Responsive Navbar/Footer
- Clean folder structure, ready to extend
- GitHub Actions CI (lint on every PR)

## 🏁 Quick Start

```bash
git clone https://github.com/MuhammadNiazAli/nextjs-supabase-starter.git
cd nextjs-supabase-starter
npm install
cp .env.example .env.local
# fill in your Supabase URL + anon key in .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 🗄️ Supabase Setup

1. Create a free project at [supabase.com](https://supabase.com)
2. Copy your Project URL and anon key into `.env.local`
3. Run `supabase/schema.sql` in the Supabase SQL editor to set up tables, the `avatars` storage bucket, and its RLS policies

## 💳 Stripe Setup (optional)

The pricing page, checkout, and webhook are opt-in — the app runs fine without Stripe configured.

1. Create a [Stripe](https://stripe.com) account and a recurring Price for your plan
2. Add `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PRICE_ID` to `.env.local`
3. Add `SUPABASE_SERVICE_ROLE_KEY` (Project Settings → API in Supabase) — needed by the webhook to write subscription status
4. Forward webhooks locally with the [Stripe CLI](https://stripe.com/docs/stripe-cli): `stripe listen --forward-to localhost:3000/api/webhooks/stripe`, then copy the printed signing secret into `STRIPE_WEBHOOK_SECRET`
5. In production, add a webhook endpoint in the Stripe Dashboard pointing at `https://your-domain.com/api/webhooks/stripe`, listening for `checkout.session.completed`, `customer.subscription.updated`, and `customer.subscription.deleted`

## 🤝 Contributing

This project is built **for the community**. See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup + guidelines.

Look for issues labeled [`good first issue`](../../issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) if you're just starting out, or [`help wanted`](../../issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22) for meatier features.

Ways to help:
- ⭐ Star the repo
- 🍴 Fork it and experiment
- 🐛 Report bugs via Issues
- 💡 Suggest features
- 🔧 Submit a Pull Request
- 👀 Review open PRs

## 🗺️ Roadmap / Ideas for contributors

- [x] Add Google OAuth login
- [ ] Add GitHub OAuth login
- [x] Add Stripe billing example
- [x] Add unit tests (Vitest)
- [x] Add i18n support
- [x] Add user profile page with avatar upload
- [ ] Add rate limiting on API routes
- [ ] Improve accessibility (a11y audit)
- [ ] Add Storybook for components

## 📄 License

MIT — free to use for personal or commercial projects. See [LICENSE](./LICENSE).

## 🙌 Maintainer

Built by [Muhammad Niaz Ali](https://github.com/MuhammadNiazAli) — full stack developer (Next.js, React Native, Supabase, Python/n8n automation).

If this project helped you, consider giving it a ⭐ it genuinely helps the repo reach more contributors.
