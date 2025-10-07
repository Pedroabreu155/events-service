import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  execute(): string {
    return 'Ok!'
  }
}
