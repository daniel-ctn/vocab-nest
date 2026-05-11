import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { dash } from '@better-auth/infra'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    sendResetPassword: async ({ user, url }) => {
      // TODO: Integrate email provider (Resend, SendGrid, AWS SES)
      // to send the reset link. The URL contains a one-time token.
      // Do not log this URL in production.
      void user
      void url
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL!],
  plugins: [
    dash({
      apiKey: process.env.BETTER_AUTH_API_KEY,
      apiUrl: process.env.BETTER_AUTH_DASH_URL,
    }),
  ],
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await db.insert(schema.userStats).values({
            userId: user.id,
            streakDays: 0,
          })
        },
      },
    },
  },
})
