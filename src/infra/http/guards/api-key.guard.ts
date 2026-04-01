import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'
import { EnvService } from '@/env/env.service'

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private envService: EnvService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()

    const apiKey = request.headers['x-api-key']

    const validApiKey = this.envService.get('API_KEY')

    if (!apiKey || apiKey !== validApiKey) {
      throw new UnauthorizedException()
    }

    return true
  }
}
