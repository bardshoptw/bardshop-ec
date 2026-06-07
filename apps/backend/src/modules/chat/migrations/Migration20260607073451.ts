import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260607073451 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "chat_message" ("id" text not null, "conversation_id" text not null, "sender_type" text check ("sender_type" in ('customer', 'agent', 'system')) not null, "body" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "chat_message_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_chat_message_deleted_at" ON "chat_message" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "conversation" ("id" text not null, "customer_name" text null, "customer_email" text null, "subject" text null, "status" text check ("status" in ('open', 'closed')) not null default 'open', "last_message_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "conversation_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_conversation_deleted_at" ON "conversation" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "chat_message" cascade;`);

    this.addSql(`drop table if exists "conversation" cascade;`);
  }

}
