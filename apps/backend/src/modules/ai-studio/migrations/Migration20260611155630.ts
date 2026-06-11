import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260611155630 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "ai_asset" ("id" text not null, "customer_id" text not null, "url" text not null, "kind" text null, "job_id" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "ai_asset_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_ai_asset_deleted_at" ON "ai_asset" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "ai_job" ("id" text not null, "customer_id" text not null, "type" text check ("type" in ('bg_remove', 'generate', 'retouch', 'upscale')) not null, "status" text check ("status" in ('pending', 'processing', 'completed', 'failed')) not null default 'pending', "prompt" text null, "input_url" text null, "output_url" text null, "credits_cost" integer not null default 0, "error" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "ai_job_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_ai_job_deleted_at" ON "ai_job" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "ai_asset" cascade;`);

    this.addSql(`drop table if exists "ai_job" cascade;`);
  }

}
