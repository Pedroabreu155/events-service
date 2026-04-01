import { ApiProperty } from '@nestjs/swagger'

export class EventPayloadDto {
  @ApiProperty({ example: '2025-10-07T14:00:00Z' })
  timestamp!: string

  @ApiProperty()
  userId!: number

  @ApiProperty()
  clientId!: number

  @ApiProperty()
  eventType!: string

  @ApiProperty()
  sourceIp!: string

  @ApiProperty({ enum: ['HIGH', 'MEDIUM', 'LOW'] })
  criticality!: 'HIGH' | 'MEDIUM' | 'LOW'

  @ApiProperty({ enum: ['SUCCESS', 'FAILURE'] })
  result!: 'SUCCESS' | 'FAILURE'

  @ApiProperty({ required: false })
  correlationId?: string

  @ApiProperty({ required: false })
  entityId?: string

  @ApiProperty({ required: false, type: Object })
  details?: Record<string, any>
}
