import { AppModule } from '@/app.module'
import { EnvService } from '@/env/env.service'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'

describe('Post event (E2E)', () => {
  let app: INestApplication
  let envService: EnvService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()

    envService = moduleRef.get(EnvService)

    await app.init()
  })

  test('SUCCESS - [POST] /v1/audit/events', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/audit/events')
      .set('x-api-key', envService.get('API_KEY'))
      .send({
        timestamp: '2025-10-07T13:45:00Z',
        userId: 123,
        clientId: 98765,
        eventType: 'LOGIN_SUCCESS',
        sourceIp: '192.168.1.10',
        criticality: 'LOW',
        result: 'SUCCESS',
        correlationId: 'corr-abc123',
        entityId: 'entity-456',
        details: {
          browser: 'Chrome',
          os: 'Windows 11',
          location: 'São Paulo, BR',
          sessionDuration: 3600,
          metadata: {
            device: 'desktop',
            screenResolution: '1920x1080',
          },
        },
      })

    expect(res.statusCode).toBe(201)
  })

  test('UNAUTHORIZED - [POST] /v1/audit/events', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/audit/events')
      .send({
        timestamp: '2025-10-07T13:45:00Z',
        userId: 123,
        clientId: 98765,
        eventType: 'LOGIN_SUCCESS',
        sourceIp: '192.168.1.10',
        criticality: 'LOW',
        result: 'SUCCESS',
        correlationId: 'corr-abc123',
        entityId: 'entity-456',
        details: {
          browser: 'Chrome',
          os: 'Windows 11',
          location: 'São Paulo, BR',
          sessionDuration: 3600,
          metadata: {
            device: 'desktop',
            screenResolution: '1920x1080',
          },
        },
      })

    expect(res.statusCode).toBe(401)
  })

  test('BAD REQUEST - [POST] /v1/audit/events', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/audit/events')
      .set('x-api-key', envService.get('API_KEY'))
      .send({
        timestamp: '2025-10-07T13:45:00Z',
        userId: '123',
        clientId: 98765,
        eventType: 'LOGIN_SUCCESS',
        sourceIp: '192.168.1.10',
        criticality: 'LOW',
        result: 'SUCCESS',
        correlationId: 'corr-abc123',
        entityId: 'entity-456',
        details: {
          browser: 'Chrome',
          os: 'Windows 11',
          location: 'São Paulo, BR',
          sessionDuration: 3600,
          metadata: {
            device: 'desktop',
            screenResolution: '1920x1080',
          },
        },
      })

    expect(res.statusCode).toBe(400)
  })
})
