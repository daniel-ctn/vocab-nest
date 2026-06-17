import { GoogleGenAI } from '@google/genai'
import type { ZodType } from 'zod'
import {
  AnswerGradeSchema,
  BulkEntriesSchema,
  EnrichmentSchema,
  type AnswerGrade,
  type Enrichment,
} from './schemas'

const MODEL = process.env.GEMINI_MODEL || 'gemini-3-flash'

/** True when a Gemini API key is present, so AI features can run. */
export function isAiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY)
}

let client: GoogleGenAI | null = null
function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('AI is not configured on this server.')
  if (!client) client = new GoogleGenAI({ apiKey })
  return client
}

/** Tolerate models that wrap JSON in markdown fences. */
function parseJson(text: string): unknown {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/, '')
    .trim()
  return JSON.parse(cleaned)
}

async function generateJson<T>(
  prompt: string,
  schema: ZodType<T>
): Promise<T> {
  const ai = getClient()
  const res = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: { responseMimeType: 'application/json', temperature: 0.4 },
  })
  const text = res.text
  if (!text) throw new Error('The AI returned an empty response.')
  let data: unknown
  try {
    data = parseJson(text)
  } catch {
    throw new Error('The AI returned malformed output. Try again.')
  }
  return schema.parse(data)
}

export async function enrichTerm(
  term: string,
  language?: string
): Promise<Enrichment> {
  const lang = language ? ` The word is in ${language}.` : ''
  const prompt = `You are a meticulous lexicographer. For the word or phrase "${term}", return a JSON object with these keys:
- "definition": a clear, concise definition (one or two sentences).
- "partOfSpeech": e.g. noun, verb, adjective.
- "pronunciation": IPA enclosed in slashes, e.g. /ˈwɜːrd/.
- "examples": an array of 2-3 natural example sentences.
- "synonyms": an array of up to 5 synonyms.
- "antonyms": an array of up to 5 antonyms (empty if none).
- "etymology": one sentence on the word's origin (empty string if unknown).
- "mnemonic": a short, vivid memory aid (empty string if none fits).${lang}
Return ONLY the JSON object, with no surrounding prose.`
  return generateJson(prompt, EnrichmentSchema)
}

export async function structureBulk(
  text: string
): Promise<{ term: string; definition: string; tags?: string[] }[]> {
  const prompt = `Extract vocabulary terms and their definitions from the text below. Return a JSON object of the form:
{ "entries": [ { "term": string, "definition": string, "tags": string[] (optional) } ] }
Write a concise definition where the text doesn't supply one. Keep at most 100 entries. Return ONLY the JSON.

TEXT:
${text}`
  const { entries } = await generateJson(prompt, BulkEntriesSchema)
  return entries
}

export async function gradeAnswer(
  term: string,
  definition: string,
  userAnswer: string
): Promise<AnswerGrade> {
  const prompt = `A learner is recalling the meaning of "${term}". The correct definition is: "${definition}". The learner wrote: "${userAnswer}".
Grade how well their answer captures the meaning. Return a JSON object:
{ "correct": boolean, "score": 0-3 (0 = wrong, 1 = close, 2 = good, 3 = perfect), "feedback": one short, encouraging sentence }
Return ONLY the JSON.`
  return generateJson(prompt, AnswerGradeSchema)
}
