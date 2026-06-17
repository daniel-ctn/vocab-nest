import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { isPro } from '@/lib/data/subscription'
import { listVocabulary } from '@/lib/data/vocabulary'
import { db } from '@/lib/db'
import { groups } from '@/lib/db/schema'
import type { VocabularyEntry } from '@/lib/contracts'

function csvCell(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

const CSV_COLUMNS: { header: string; get: (e: VocabularyEntry) => string }[] = [
  { header: 'term', get: (e) => e.term },
  { header: 'definition', get: (e) => e.definition },
  { header: 'part_of_speech', get: (e) => e.partOfSpeech ?? '' },
  { header: 'pronunciation', get: (e) => e.pronunciation ?? '' },
  { header: 'language', get: (e) => e.language ?? '' },
  { header: 'synonyms', get: (e) => e.synonyms.join('; ') },
  { header: 'antonyms', get: (e) => e.antonyms.join('; ') },
  { header: 'etymology', get: (e) => e.etymology ?? '' },
  { header: 'mnemonic', get: (e) => e.mnemonic ?? '' },
  { header: 'examples', get: (e) => e.examples.join('; ') },
  { header: 'tags', get: (e) => e.tags.join('; ') },
  { header: 'notes', get: (e) => e.notes ?? '' },
]

function toCsv(entries: VocabularyEntry[]): string {
  const lines = [CSV_COLUMNS.map((c) => c.header).join(',')]
  for (const entry of entries) {
    lines.push(CSV_COLUMNS.map((c) => csvCell(c.get(entry))).join(','))
  }
  return lines.join('\n')
}

export async function GET(req: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!(await isPro(user.id))) {
    return NextResponse.json(
      { error: 'Exporting your data is a Pro feature.' },
      { status: 403 }
    )
  }

  const format =
    new URL(req.url).searchParams.get('format') === 'csv' ? 'csv' : 'json'
  const entries = await listVocabulary(user.id)
  const stamp = new Date().toISOString().slice(0, 10)

  if (format === 'csv') {
    return new NextResponse(toCsv(entries), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="vocab-nest-${stamp}.csv"`,
      },
    })
  }

  const groupRows = await db
    .select({
      id: groups.id,
      name: groups.name,
      description: groups.description,
      createdAt: groups.createdAt,
    })
    .from(groups)
    .where(eq(groups.userId, user.id))

  const payload = {
    exportedAt: new Date().toISOString(),
    vocabulary: entries,
    groups: groupRows.map((g) => ({
      id: g.id,
      name: g.name,
      description: g.description,
      createdAt: g.createdAt.toISOString(),
    })),
  }

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="vocab-nest-${stamp}.json"`,
    },
  })
}
