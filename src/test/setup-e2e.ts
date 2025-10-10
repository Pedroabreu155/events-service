import 'dotenv/config'
import { beforeAll, afterAll } from 'vitest'
import { randomUUID } from 'node:crypto'
import { execSync } from 'node:child_process'

import { PrismaClient } from '../../generated/prisma'

const prisma = new PrismaClient()
const schemaId = randomUUID()

function generateUniqueDBUrl(schemaId: string) {
  if (!process.env.DATABASE_URL) {
    throw new Error('provide a DATABASE_URL')
  }

  const url = new URL(process.env.DATABASE_URL)

  url.searchParams.set('schema', schemaId)

  return url.toString()
}

beforeAll(async () => {
  const url = generateUniqueDBUrl(schemaId)

  process.env.DATABASE_URL = url

  execSync('npx prisma migrate deploy')
})

afterAll(async () => {
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`)
  await prisma.$disconnect()
})
