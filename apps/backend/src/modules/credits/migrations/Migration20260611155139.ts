import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260611155139 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "credit_wallet" drop constraint if exists "credit_wallet_customer_id_unique";`);
    this.addSql(`create table if not exists "credit_transaction" ("id" text not null, "wallet_id" text not null, "delta" integer not null, "type" text check ("type" in ('topup', 'spend', 'refund', 'adjust')) not null, "reason" text null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "credit_transaction_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_credit_transaction_deleted_at" ON "credit_transaction" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "credit_wallet" ("id" text not null, "customer_id" text not null, "balance" integer not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "credit_wallet_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_credit_wallet_customer_id_unique" ON "credit_wallet" ("customer_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_credit_wallet_deleted_at" ON "credit_wallet" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "credit_transaction" cascade;`);

    this.addSql(`drop table if exists "credit_wallet" cascade;`);
  }

}
