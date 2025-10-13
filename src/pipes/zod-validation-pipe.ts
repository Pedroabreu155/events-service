import { PipeTransform, BadRequestException } from '@nestjs/common'
import { ZodType, ZodError } from 'zod'

export class ZodValidationPipe<T> implements PipeTransform {
  constructor(private schema: ZodType<T>) {}

  transform(value: unknown): T {
    try {
      return this.schema.parse(value)
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          message: 'Validation failed',
          errors: error.issues,
        })
      }

      throw new BadRequestException('Validation failed')
    }
  }
}
