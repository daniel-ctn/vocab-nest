import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { dash } from '@better-auth/infra'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { sendEmail } from '@/lib/email'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    sendResetPassword: async ({ user, url }) => {
      // The URL contains a one-time token — never log it in production.
      await sendEmail({
        to: user.email,
        subject: 'Reset your Vocab Nest password',
        text: `Reset your password using this link: ${url}\n\nIf you didn't request this, you can safely ignore this email.`,
        html: `
          <div style="font-family: Georgia, 'Times New Roman', serif; color: #211a10; max-width: 480px; margin: 0 auto;">
            <h1 style="font-size: 22px; font-weight: 600;">Reset your password</h1>
            <p style="font-size: 15px; line-height: 1.6; color: #6a5f4c;">
              We received a request to reset your Vocab Nest password. Click the
              button below to choose a new one. This link expires shortly.
            </p>
            <p style="margin: 28px 0;">
              <a href="${url}" style="background: #211a10; color: #f7f2e7; text-decoration: none; padding: 12px 22px; font-size: 14px; border-radius: 2px; display: inline-block;">
                Reset password
              </a>
            </p>
            <p style="font-size: 13px; line-height: 1.6; color: #9a8f79;">
              If you didn't request this, you can safely ignore this email.
            </p>
          </div>
        `,
      })
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
