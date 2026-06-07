import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260607064519 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "form_definition" drop constraint if exists "form_definition_handle_unique";`);
    this.addSql(`create table if not exists "form_definition" ("id" text not null, "handle" text not null, "title" text not null, "description" text null, "fields" jsonb not null, "enabled" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "form_definition_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_form_definition_handle_unique" ON "form_definition" ("handle") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_form_definition_deleted_at" ON "form_definition" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "form_submission" ("id" text not null, "form_handle" text not null, "data" jsonb not null, "email" text null, "status" text check ("status" in ('new', 'read', 'archived')) not null default 'new', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "form_submission_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_form_submission_deleted_at" ON "form_submission" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "form_definition" cascade;`);

    this.addSql(`drop table if exists "form_submission" cascade;`);
  }

}
