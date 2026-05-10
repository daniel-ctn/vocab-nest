import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { db } from './index'

await migrate(db, { migrationsFolder: './drizzle' })
console.log('Migrations applied successfully.')
process.exit(0)
