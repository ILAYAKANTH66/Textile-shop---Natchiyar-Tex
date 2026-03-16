## NATCHIYAR TEX (Wholesale)

Full-stack Next.js (App Router) + Prisma project for a wholesale textile catalog with customer ordering and an admin dashboard.

## Getting Started

### Prerequisites

- Node.js 18+

### Environment variables

Create `.env` (already present for SQLite dev) or `.env.local` with at minimum:

```bash
# SQLite (dev)
DATABASE_URL="file:./dev.db"

# JWT (set your own for production)
JWT_SECRET="change-me"
```

Optional email (order & signup confirmations) via SMTP:

```bash
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="username"
SMTP_PASS="password"
SMTP_FROM="NATCHIYAR TEX <no-reply@natchiyartex.com>"
```

Optional phone messaging provider (placeholder hook):

```bash
MESSAGING_PROVIDER="twilio"
```

### Database setup (SQLite dev)

```bash
npm install
npx prisma db push
npx prisma generate
npx prisma db seed
```

### Run the development server

```bash
npm run dev
```

Open the URL printed in the terminal (it may be `http://localhost:3001` if 3000 is already in use).

### Admin login (seeded)

- **URL**: `/admin/login`
- **Email**: `admin@natchiyartex.com`
- **Password**: `adminpassword`

### Production / Cloud deployment notes

- **PostgreSQL**: switch `DATABASE_URL` to a Postgres connection string and change `provider` in `prisma/schema.prisma` to `"postgresql"`.
- Run `npm run build` and `npm start` for production.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
