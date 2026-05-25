import { CACHE_MANAGER, Controller, Get, HttpCode, HttpStatus, Inject } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { Cache } from 'cache-manager'
import { DataSource } from 'typeorm'

@Controller('health')
export class HealthController {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async check() {
    const dbStatus = await this.dataSource.query('SELECT 1')
    await this.cacheManager.set('health-check', 'ok', { ttl: 5 })
    const cacheStatus = await this.cacheManager.get('health-check')

    return {
      status: 'ok',
      database: Array.isArray(dbStatus) ? 'connected' : 'unknown',
      cache: cacheStatus === 'ok' ? 'connected' : 'failed',
      timestamp: new Date().toISOString(),
    }
  }
}
