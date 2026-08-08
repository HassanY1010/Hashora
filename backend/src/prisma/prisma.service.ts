import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();
    try {
      // High Performance SQLite WAL & Memory Pragmas
      await this.$executeRawUnsafe(`PRAGMA journal_mode = WAL;`);
      await this.$executeRawUnsafe(`PRAGMA synchronous = NORMAL;`);
      await this.$executeRawUnsafe(`PRAGMA cache_size = -64000;`); // 64MB memory cache
      await this.$executeRawUnsafe(`PRAGMA temp_store = MEMORY;`);
      await this.$executeRawUnsafe(`PRAGMA mmap_size = 268435456;`);
      this.logger.log('SQLite High Performance WAL & Memory Caching enabled.');
    } catch (e) {
      // Ignored if non-sqlite provider
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
