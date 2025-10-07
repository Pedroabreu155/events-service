import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { z } from 'zod'

export const envSchema = z.object({
  DATABASE_URL: z.url(),
  PORT: z.coerce.number().optional().default(3333),
  API_KEY: z.string(),
})

export type Env = z.infer<typeof envSchema>

@Injectable()
export class EnvService {
  constructor(private configService: ConfigService<Env, true>) {}

  get<T extends keyof Env>(key: T) {
    return this.configService.get<T>(key, { infer: true })
  }
}
