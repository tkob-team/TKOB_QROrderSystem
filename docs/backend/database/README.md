# Database Documentation Index

Welcome to the database documentation for the TKQR-in Ordering Platform.

---

## Quick Links

- **[Schema Description](./description.md)** - Comprehensive database schema documentation
  - Schema overview (multi-tenant isolation, naming conventions)
  - Domain models (Tenants, Users, Tables, Menu, Orders, Payments, Subscriptions, etc.)
  - Enums reference
  - Business rules and constraints

- **[ER Diagram](./er_diagram.md)** - Entity-Relationship diagram
  - Visual representation of database relationships
  - Key foreign keys and associations

- **[Prisma Schema](../../../source/apps/api/prisma/schema.prisma)** - Source of truth
  - Complete Prisma schema definition
  - All models, enums, and relations

- **[Migrations](../../../source/apps/api/prisma/migrations/)** - Database migration history
  - 20+ migrations applied
  - Migration lock file

---

## Database Technology Stack

- **Database**: PostgreSQL
- **ORM**: Prisma 5.x
- **Migration Tool**: Prisma Migrate
- **Isolation**: Application-level `tenantId` filtering

---

## Quick Start (Local Development)

### Prerequisites

- Node.js 20+
- PostgreSQL 14+ installed locally or via Docker
- pnpm package manager

### Option 1: Docker Compose (Recommended)

```bash
# Start PostgreSQL in Docker
cd source/docker
docker compose up -d postgres

# Wait for PostgreSQL to be ready
# Database will be available at: postgresql://postgres:postgres@localhost:5432/tkqr_dev
```

### Option 2: Local PostgreSQL

```bash
# Ensure PostgreSQL is running locally
# Update .env file with your database URL:
DATABASE_URL="postgresql://your_user:your_password@localhost:5432/your_database"
```

### Apply Migrations

```bash
# Navigate to API directory
cd source/apps/api

# Apply all pending migrations
pnpm prisma migrate deploy

# OR for development (creates new migrations)
pnpm prisma migrate dev

# Generate Prisma Client
pnpm prisma generate
```

### Seed Database (Optional)

```bash
# Seed with default data (subscription plans, sample tenant)
cd source/apps/api
ADD HERE
```

### View Database in Prisma Studio

```bash
# Open Prisma Studio GUI
cd source/apps/api
pnpm prisma studio

# Opens at: http://localhost:5555
```

---

## Common Commands

### Create New Migration

```bash
cd source/apps/api
pnpm prisma migrate dev --name describe_your_changes
```

### Reset Database (⚠️ Destructive)

```bash
cd source/apps/api
pnpm prisma migrate reset
# This will drop the database, recreate it, and apply all migrations
```

### Check Migration Status

```bash
cd source/apps/api
pnpm prisma migrate status
```

### Format Schema

```bash
cd source/apps/api
pnpm prisma format
```

---

## Database Connection

### Environment Variables

Configure these in your `.env` file:

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tkqr_dev"

# Optional: Direct connection for Prisma Studio
DATABASE_URL_DIRECT="postgresql://postgres:postgres@localhost:5432/tkqr_dev"
```

### Connection Pool Settings

- **Default Pool Size**: 10 connections (Prisma default)
- **Connection Timeout**: 10 seconds
- **For Production**: Use connection pooler (PgBouncer) for horizontal scaling

---

## Schema Conventions

### Table Names
- Lowercase snake_case plural (e.g., `menu_items`, `user_sessions`)

### Column Names
- Lowercase snake_case (e.g., `created_at`, `tenant_id`)
- Foreign keys follow `{entity}_id` pattern

### Primary Keys
- UUID v4 format (`@id @default(uuid())`)

### Timestamps
- All tables include `created_at` and `updated_at`
- Auto-managed by Prisma

### Multi-Tenant Isolation
- Every tenant-scoped table has `tenant_id` foreign key
- Composite indexes on `(tenant_id, ...)` for performance
- Application-level filtering via Prisma middleware

---

## Migration History

**Latest Migration**: `20260119060909_add_user_avatar`  
**Total Migrations**: 20+

### Key Milestones

1. **Init** (`20251124113547`) - Initial auth and tenant models
2. **Payments** (`20251204091502`) - Payment configuration schema
3. **Tables** (`20251216035526`) - Table management
4. **Sessions** (`20251218110840`) - Haidilao-style table sessions
5. **Photos** (`20251222071034`) - Menu item photo support
6. **Orders** (`20260102014103`) - Order system
7. **KDS** (`20260109164002`) - Kitchen Display System timestamps
8. **Cart** (`20260111051002`) - Shopping cart
9. **Payments** (`20260111053918`) - SePay integration
10. **Subscriptions** (`20260114170300`) - Subscription tiers
11. **Bills** (`20260118102004`) - Bill consolidation

View full migration history in [migrations folder](../../../source/apps/api/prisma/migrations/).

---

## Backup & Recovery

### Backup Database

```bash
# Backup with pg_dump
pg_dump -h localhost -U postgres -d tkqr_dev > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup specific schemas
ADD HERE
```

### Restore Database

```bash
# Restore from backup
psql -h localhost -U postgres -d tkqr_dev < backup_file.sql

# Or use Prisma migrate
ADD HERE
```

---

## Performance Tips

1. **Indexes**: Critical indexes already defined on:
   - `(tenant_id, ...)` for all tenant-scoped queries
   - Foreign keys for join performance
   - Status fields for filtering

2. **Query Optimization**:
   - Always filter by `tenant_id` first
   - Use `select` to limit returned fields
   - Use `include` judiciously (avoid N+1 queries)

3. **Connection Pooling**:
   - Use PgBouncer in production
   - Configure pool size based on load

4. **Caching**:
   - Redis for frequently accessed data (menu items, tenant settings)
   - See [ARCHITECTURE.md](../../common/ARCHITECTURE.md) for caching strategy

---

## Troubleshooting

### Migration Conflicts

```bash
# If migrations are out of sync
cd source/apps/api
pnpm prisma migrate resolve --applied <migration_name>

# Force reset (⚠️ loses data)
pnpm prisma migrate reset
```

### Connection Issues

```bash
# Test database connection
cd source/apps/api
pnpm prisma db pull
# If successful, connection is working
```

### Prisma Client Generation

```bash
# Regenerate Prisma Client
cd source/apps/api
pnpm prisma generate

# If types are not recognized, restart TypeScript server in your IDE
```

---

## Additional Resources

- **Prisma Documentation**: https://www.prisma.io/docs
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **Project Architecture**: [ARCHITECTURE.md](../../common/ARCHITECTURE.md)
- **API Documentation**: [OpenAPI Spec](../../common/openapi.exported.json)

---

**Last Updated**: 2026-01-20  
**Maintained By**: Development Team
