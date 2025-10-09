import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { z } from 'zod'
import { envSchema } from './env'

@Injectable()
export class EnvService {
  constructor(
    private readonly config: ConfigService<z.infer<typeof envSchema>, true>,
  ) {}

  get<K extends keyof z.infer<typeof envSchema>>(key: K) {
    return this.config.get<K>(key, { infer: true })
  }
}
