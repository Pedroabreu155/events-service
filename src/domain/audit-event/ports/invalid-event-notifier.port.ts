import { FailedEventPayload } from '../audit-event.types'

export const INVALID_EVENT_NOTIFIER_PORT = Symbol('INVALID_EVENT_NOTIFIER_PORT')

export interface InvalidEventNotifierPort {
  notifyInvalidEvent(payload: FailedEventPayload): Promise<void>
}
