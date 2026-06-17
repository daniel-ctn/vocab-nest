import { and, eq, lte, sql } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  user,
  userStats,
  vocabularyEntries,
  vocabularyReviewStats,
} from '@/lib/db/schema'
import { getDueWordsPreview } from '@/lib/data/dashboard'
import { sendEmail } from '@/lib/email'

function reminderHtml(name: string, due: number, words: string[]): string {
  const preview = words.length
    ? `<p style="font-size:14px;color:#6a5f4c;">Waiting for you: <em>${words.join(
        ', '
      )}</em>.</p>`
    : ''
  return `
    <div style="font-family: Georgia, 'Times New Roman', serif; color:#211a10; max-width:480px; margin:0 auto;">
      <h1 style="font-size:22px; font-weight:600;">${due} word${due === 1 ? '' : 's'} await${due === 1 ? 's' : ''} review</h1>
      <p style="font-size:15px; line-height:1.6; color:#6a5f4c;">
        ${name ? `${name}, a` : 'A'} few minutes keeps your streak — and your
        words — alive.
      </p>
      ${preview}
      <p style="margin:24px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/practice" style="background:#211a10; color:#f7f2e7; text-decoration:none; padding:12px 22px; font-size:14px; border-radius:2px; display:inline-block;">
          Practice now
        </a>
      </p>
    </div>`
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const todayUtc = now.toISOString().slice(0, 10)

  const candidates = await db
    .select({
      userId: userStats.userId,
      email: user.email,
      name: user.name,
      lastPracticeDate: userStats.lastPracticeDate,
    })
    .from(userStats)
    .innerJoin(user, eq(userStats.userId, user.id))
    .where(eq(userStats.emailReminders, true))

  let sent = 0
  for (const c of candidates) {
    // lastPracticeDate is a day-key in the user's own timezone, so for users
    // ahead of UTC it can read as "tomorrow" relative to todayUtc. A lexical
    // >= comparison skips anyone who has already practiced on their local
    // today (or later), not just those whose key happens to equal todayUtc.
    if (c.lastPracticeDate && c.lastPracticeDate >= todayUtc) continue

    const due = await db
      .select({ count: sql<number>`count(*)` })
      .from(vocabularyReviewStats)
      .innerJoin(
        vocabularyEntries,
        eq(vocabularyReviewStats.vocabularyId, vocabularyEntries.id)
      )
      .where(
        and(
          eq(vocabularyEntries.userId, c.userId),
          lte(vocabularyReviewStats.nextReviewAt, now)
        )
      )
      .then((rows) => Number(rows[0]?.count ?? 0))

    if (due === 0) continue

    const preview = await getDueWordsPreview(c.userId, 3)
    const ok = await sendEmail({
      to: c.email,
      subject: `${due} word${due === 1 ? '' : 's'} due in Vocab Nest`,
      text: `You have ${due} word${due === 1 ? '' : 's'} due for review. Practice now: ${process.env.NEXT_PUBLIC_APP_URL}/practice`,
      html: reminderHtml(
        c.name ?? '',
        due,
        preview.map((p) => p.term)
      ),
    })
    if (ok) sent++
  }

  return NextResponse.json({ candidates: candidates.length, sent })
}
