import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { AsyncLocalStorage } from 'async_hooks'; // Built-in Node.js module
import { EnvConfig } from '../config/env.validation';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  // CORE: Sử dụng AsyncLocalStorage để lưu tenantId an toàn cho từng Request
  private readonly asyncLocalStorage = new AsyncLocalStorage<Map<string, string>>();

  private _extendedClient: ReturnType<typeof this.createExtendedClient>;

  constructor(private readonly configService: ConfigService<EnvConfig, true>) {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
      ],
    });
  }

  // Getter để truy cập vào client đã được inject logic multi-tenant
  get x() {
    if (!this._extendedClient) {
      this._extendedClient = this.createExtendedClient();
    }
    return this._extendedClient;
  }

  async onModuleInit() {
    await this.$connect();

    // Logging setup - only log queries when LOG_LEVEL is 'debug'
    // @ts-expect-error Prisma type bug workaround
    this.$on('query', (e: any) => {
      const logLevel = (process.env.LOG_LEVEL || 'info').toLowerCase();
      if (logLevel === 'debug') {
        this.logger.debug(`Duration: ${e.duration}ms | Query: ${e.query}`);
      }
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // --- CONTEXT MANAGEMENT (Thread-safe) ---

  /**
   * Chạy một callback trong context của một tenant cụ thể.
   * Middleware/Guard sẽ gọi hàm này.
   */
  runWithTenantId<T>(tenantId: string, callback: () => T): T {
    const store = new Map<string, string>();
    store.set('tenantId', tenantId);
    // Mọi code chạy trong callback sẽ truy cập được đúng store này
    return this.asyncLocalStorage.run(store, callback);
  }

  getTenantId(): string | undefined {
    const store = this.asyncLocalStorage.getStore();
    return store?.get('tenantId');
  }

  // --- PRISMA EXTENSION (Thay thế Middleware $use) ---

  private createExtendedClient() {
    // QUAN TRỌNG: Capture `this` context TRƯỚC KHI vào extension
    const self = this;

    return this.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            // Dùng `self` thay vì `this`
            const tenantId = self.getTenantId();

            const tenantModels = [
              'User',
              'Table',
              'MenuCategory',
              'MenuItem',
              'ModifierGroup',
              'ModifierOption',
              'Order',
              'OrderItem',
              'OrderActivityLog',
            ];

            if (!tenantId || !tenantModels.includes(model as string)) {
              return query(args);
            }

            const _args = args as any;

            if (
              [
                'findUnique',
                'findFirst',
                'findMany',
                'count',
                'aggregate',
                'update',
                'updateMany',
                'upsert',
                'delete',
                'deleteMany',
              ].includes(operation)
            ) {
              _args.where = {
                ..._args.where,
                tenantId: tenantId,
              };
            }

            if (operation === 'create') {
              _args.data = {
                ..._args.data,
                tenantId: tenantId,
              };
            }

            if (operation === 'createMany') {
              if (Array.isArray(_args.data)) {
                _args.data = _args.data.map((item: any) => ({ ...item, tenantId }));
              } else {
                _args.data = { ..._args.data, tenantId };
              }
            }

            return query(_args);
          },
        },
      },
    });
  }
}
