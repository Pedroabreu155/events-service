import { AppModule } from '@/app.module'
import { EnvService } from '@/env/env.service'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { describe, beforeAll, beforeEach, test, expect } from 'vitest'

describe('List events (E2E)', () => {
	let app: INestApplication
	let envService: EnvService
	let prisma: PrismaService

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [AppModule],
		}).compile()

		app = moduleRef.createNestApplication()
		envService = moduleRef.get(EnvService)
		prisma = moduleRef.get(PrismaService)
		await app.init()
	})

	beforeEach(async () => {
		await prisma.eventoAuditoria.deleteMany()
	})

	test('SUCCESS - [GET] /v1/audit/events', async () => {
		// Seed data
		await prisma.eventoAuditoria.create({
			data: {
				ts_transaction: new Date(),
				id_user: 111,
				id_company: 222,
				tp_event: 'TEST_FILTER_EVENT',
				ip_host: '127.0.0.1',
				id_severity: 'LOW',
				id_result: 'SUCCESS',
				ts_created_at: new Date(),
				created_by: 'test',
				updated_by: 'test',
			},
		})

		const res = await request(app.getHttpServer())
			.get('/v1/audit/events')
			.set('x-api-key', envService.get('API_KEY'))
			.query({ userId: 111, eventType: 'TEST_FILTER' })

		expect(res.statusCode).toBe(200)
		expect(res.body.total).toBe(1)
		expect(res.body.events[0]).toMatchObject({
			id: expect.any(Number),
			userId: 111,
			eventType: 'TEST_FILTER_EVENT',
		})
	})

	test('FILTER BY DATE - [GET] /v1/audit/events', async () => {
		const oldDate = new Date('2020-01-01')
		const newDate = new Date('2026-01-01')

		await prisma.eventoAuditoria.createMany({
			data: [
				{
					ts_transaction: oldDate,
					id_user: 1,
					id_company: 1,
					tp_event: 'OLD',
					ip_host: '127.0.0.1',
					id_severity: 'LOW',
					id_result: 'SUCCESS',
					ts_created_at: new Date(),
					created_by: 'test',
					updated_by: 'test',
				},
				{
					ts_transaction: newDate,
					id_user: 2,
					id_company: 2,
					tp_event: 'NEW',
					ip_host: '127.0.0.1',
					id_severity: 'LOW',
					id_result: 'SUCCESS',
					ts_created_at: new Date(),
					created_by: 'test',
					updated_by: 'test',
				},
			],
		})

		const res = await request(app.getHttpServer())
			.get('/v1/audit/events')
			.set('x-api-key', envService.get('API_KEY'))
			.query({ startDate: '2025-01-01T00:00:00Z' })

		expect(res.statusCode).toBe(200)
		expect(res.body.total).toBe(1)
		expect(res.body.events[0].eventType).toBe('NEW')
	})

	test('UNAUTHORIZED - [GET] /v1/audit/events', async () => {
		const res = await request(app.getHttpServer()).get('/v1/audit/events')

		expect(res.statusCode).toBe(401)
	})

	test('BAD REQUEST - [GET] /v1/audit/events (Invalid limit)', async () => {
		const res = await request(app.getHttpServer()).get('/v1/audit/events').set('x-api-key', envService.get('API_KEY')).query({ limit: 500 }) // Max is 100

		expect(res.statusCode).toBe(400)
		expect(res.body).toHaveProperty('message', 'Validation failed')
	})
})
