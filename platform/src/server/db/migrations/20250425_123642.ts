import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "test_cases" ADD COLUMN "content" varchar;
  ALTER TABLE "payload_jobs_log" ADD COLUMN "parent_task_slug" varchar;
  ALTER TABLE "payload_jobs_log" ADD COLUMN "parent_task_i_d" varchar;
  ALTER TABLE "test_cases" DROP COLUMN IF EXISTS "statement";
  ALTER TABLE "test_cases" DROP COLUMN IF EXISTS "guidance";
  ALTER TABLE "test_cases" DROP COLUMN IF EXISTS "enhancements";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "test_cases" ADD COLUMN "statement" varchar;
  ALTER TABLE "test_cases" ADD COLUMN "guidance" varchar;
  ALTER TABLE "test_cases" ADD COLUMN "enhancements" varchar;
  ALTER TABLE "test_cases" DROP COLUMN IF EXISTS "content";
  ALTER TABLE "payload_jobs_log" DROP COLUMN IF EXISTS "parent_task_slug";
  ALTER TABLE "payload_jobs_log" DROP COLUMN IF EXISTS "parent_task_i_d";`)
}
