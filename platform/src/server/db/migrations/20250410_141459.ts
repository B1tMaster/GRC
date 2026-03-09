import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"role" varchar DEFAULT 'user' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"_verified" boolean,
  	"_verificationtoken" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE IF NOT EXISTS "authoritative_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"doc_type" varchar NOT NULL,
  	"s3_url" varchar,
  	"s3_key" varchar,
  	"ingest_status" varchar,
  	"table_of_contents" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "test_suites" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"alias" varchar NOT NULL,
  	"authoritative_document_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "test_cases_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"href" varchar,
  	"relation_type" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "test_cases" (
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"suite_id" integer,
  	"methodology" varchar,
  	"metadata_version" varchar,
  	"metadata_pdf_pages_range" varchar NOT NULL,
  	"metadata_doc_pages_range" varchar NOT NULL,
  	"statement" varchar,
  	"guidance" varchar,
  	"enhancements" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "tests_result_suites_cases_gaps_document_evidence" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"citation" varchar,
  	"location" varchar,
  	"context" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "tests_result_suites_cases_gaps_control_evidence" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"citation" varchar,
  	"location" varchar,
  	"context" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "tests_result_suites_cases_gaps_recommendation_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"step" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "tests_result_suites_cases_gaps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"severity" varchar,
  	"impact_security" varchar,
  	"impact_compliance" varchar,
  	"impact_operational" varchar,
  	"recommendation_description" varchar,
  	"recommendation_priority" varchar,
  	"recommendation_expected_outcome" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "tests_result_suites_cases_overall_recommendations_dependencies" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"dependency" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "tests_result_suites_cases" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"case_id" varchar,
  	"summary_status" varchar,
  	"summary_confidence_level" varchar,
  	"summary_briefing" varchar,
  	"overall_recommendations_priority" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "tests_result" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"suites_suite_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "tests" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"status" varchar DEFAULT 'CREATED',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "tests_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"input_files_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "input_files" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"s3_url" varchar,
  	"parsed_text" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" varchar NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" varchar NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE IF NOT EXISTS "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"workflow_slug" varchar,
  	"task_slug" varchar,
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"authoritative_documents_id" integer,
  	"test_suites_id" integer,
  	"test_cases_id" varchar,
  	"tests_id" integer,
  	"input_files_id" integer,
  	"payload_jobs_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "dev_panel" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"limit_tests" boolean DEFAULT true,
  	"workflow_batch_size" numeric DEFAULT 3,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  DO $$ BEGIN
   ALTER TABLE "test_suites" ADD CONSTRAINT "test_suites_authoritative_document_id_authoritative_documents_id_fk" FOREIGN KEY ("authoritative_document_id") REFERENCES "public"."authoritative_documents"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "test_cases_links" ADD CONSTRAINT "test_cases_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."test_cases"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "test_cases" ADD CONSTRAINT "test_cases_suite_id_test_suites_id_fk" FOREIGN KEY ("suite_id") REFERENCES "public"."test_suites"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "tests_result_suites_cases_gaps_document_evidence" ADD CONSTRAINT "tests_result_suites_cases_gaps_document_evidence_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tests_result_suites_cases_gaps"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "tests_result_suites_cases_gaps_control_evidence" ADD CONSTRAINT "tests_result_suites_cases_gaps_control_evidence_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tests_result_suites_cases_gaps"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "tests_result_suites_cases_gaps_recommendation_steps" ADD CONSTRAINT "tests_result_suites_cases_gaps_recommendation_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tests_result_suites_cases_gaps"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "tests_result_suites_cases_gaps" ADD CONSTRAINT "tests_result_suites_cases_gaps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tests_result_suites_cases"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "tests_result_suites_cases_overall_recommendations_dependencies" ADD CONSTRAINT "tests_result_suites_cases_overall_recommendations_dependencies_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tests_result_suites_cases"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "tests_result_suites_cases" ADD CONSTRAINT "tests_result_suites_cases_case_id_test_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."test_cases"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "tests_result_suites_cases" ADD CONSTRAINT "tests_result_suites_cases_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tests_result"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "tests_result" ADD CONSTRAINT "tests_result_suites_suite_id_test_suites_id_fk" FOREIGN KEY ("suites_suite_id") REFERENCES "public"."test_suites"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "tests_result" ADD CONSTRAINT "tests_result_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tests"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "tests_rels" ADD CONSTRAINT "tests_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tests"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "tests_rels" ADD CONSTRAINT "tests_rels_input_files_fk" FOREIGN KEY ("input_files_id") REFERENCES "public"."input_files"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_authoritative_documents_fk" FOREIGN KEY ("authoritative_documents_id") REFERENCES "public"."authoritative_documents"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_test_suites_fk" FOREIGN KEY ("test_suites_id") REFERENCES "public"."test_suites"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_test_cases_fk" FOREIGN KEY ("test_cases_id") REFERENCES "public"."test_cases"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_test_runs_fk" FOREIGN KEY ("tests_id") REFERENCES "public"."tests"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_input_files_fk" FOREIGN KEY ("input_files_id") REFERENCES "public"."input_files"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payload_jobs_fk" FOREIGN KEY ("payload_jobs_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX IF NOT EXISTS "authoritative_documents_title_idx" ON "authoritative_documents" USING btree ("title");
  CREATE INDEX IF NOT EXISTS "authoritative_documents_updated_at_idx" ON "authoritative_documents" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "authoritative_documents_created_at_idx" ON "authoritative_documents" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "test_suites_title_idx" ON "test_suites" USING btree ("title");
  CREATE INDEX IF NOT EXISTS "test_suites_alias_idx" ON "test_suites" USING btree ("alias");
  CREATE INDEX IF NOT EXISTS "test_suites_authoritative_document_idx" ON "test_suites" USING btree ("authoritative_document_id");
  CREATE INDEX IF NOT EXISTS "test_suites_updated_at_idx" ON "test_suites" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "test_suites_created_at_idx" ON "test_suites" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "test_cases_links_order_idx" ON "test_cases_links" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "test_cases_links_parent_id_idx" ON "test_cases_links" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "test_cases_title_idx" ON "test_cases" USING btree ("title");
  CREATE INDEX IF NOT EXISTS "test_cases_suite_idx" ON "test_cases" USING btree ("suite_id");
  CREATE INDEX IF NOT EXISTS "test_cases_updated_at_idx" ON "test_cases" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "test_cases_created_at_idx" ON "test_cases" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "tests_result_suites_cases_gaps_document_evidence_order_idx" ON "tests_result_suites_cases_gaps_document_evidence" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "tests_result_suites_cases_gaps_document_evidence_parent_id_idx" ON "tests_result_suites_cases_gaps_document_evidence" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "tests_result_suites_cases_gaps_control_evidence_order_idx" ON "tests_result_suites_cases_gaps_control_evidence" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "tests_result_suites_cases_gaps_control_evidence_parent_id_idx" ON "tests_result_suites_cases_gaps_control_evidence" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "tests_result_suites_cases_gaps_recommendation_steps_order_idx" ON "tests_result_suites_cases_gaps_recommendation_steps" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "tests_result_suites_cases_gaps_recommendation_steps_parent_id_idx" ON "tests_result_suites_cases_gaps_recommendation_steps" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "tests_result_suites_cases_gaps_order_idx" ON "tests_result_suites_cases_gaps" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "tests_result_suites_cases_gaps_parent_id_idx" ON "tests_result_suites_cases_gaps" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "tests_result_suites_cases_overall_recommendations_dependencies_order_idx" ON "tests_result_suites_cases_overall_recommendations_dependencies" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "tests_result_suites_cases_overall_recommendations_dependencies_parent_id_idx" ON "tests_result_suites_cases_overall_recommendations_dependencies" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "tests_result_suites_cases_order_idx" ON "tests_result_suites_cases" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "tests_result_suites_cases_parent_id_idx" ON "tests_result_suites_cases" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "tests_result_suites_cases_case_idx" ON "tests_result_suites_cases" USING btree ("case_id");
  CREATE INDEX IF NOT EXISTS "tests_result_order_idx" ON "tests_result" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "tests_result_parent_id_idx" ON "tests_result" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "tests_result_suites_suites_suite_idx" ON "tests_result" USING btree ("suites_suite_id");
  CREATE INDEX IF NOT EXISTS "tests_updated_at_idx" ON "tests" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "tests_created_at_idx" ON "tests" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "tests_rels_order_idx" ON "tests_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "tests_rels_parent_idx" ON "tests_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "tests_rels_path_idx" ON "tests_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "tests_rels_input_files_id_idx" ON "tests_rels" USING btree ("input_files_id");
  CREATE INDEX IF NOT EXISTS "input_files_updated_at_idx" ON "input_files" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "input_files_created_at_idx" ON "input_files" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX IF NOT EXISTS "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX IF NOT EXISTS "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX IF NOT EXISTS "payload_jobs_workflow_slug_idx" ON "payload_jobs" USING btree ("workflow_slug");
  CREATE INDEX IF NOT EXISTS "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX IF NOT EXISTS "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX IF NOT EXISTS "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX IF NOT EXISTS "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX IF NOT EXISTS "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_authoritative_documents_id_idx" ON "payload_locked_documents_rels" USING btree ("authoritative_documents_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_test_suites_id_idx" ON "payload_locked_documents_rels" USING btree ("test_suites_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_test_cases_id_idx" ON "payload_locked_documents_rels" USING btree ("test_cases_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_tests_id_idx" ON "payload_locked_documents_rels" USING btree ("tests_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_input_files_id_idx" ON "payload_locked_documents_rels" USING btree ("input_files_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_payload_jobs_id_idx" ON "payload_locked_documents_rels" USING btree ("payload_jobs_id");
  CREATE INDEX IF NOT EXISTS "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX IF NOT EXISTS "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX IF NOT EXISTS "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users" CASCADE;
  DROP TABLE "authoritative_documents" CASCADE;
  DROP TABLE "test_suites" CASCADE;
  DROP TABLE "test_cases_links" CASCADE;
  DROP TABLE "test_cases" CASCADE;
  DROP TABLE "tests_result_suites_cases_gaps_document_evidence" CASCADE;
  DROP TABLE "tests_result_suites_cases_gaps_control_evidence" CASCADE;
  DROP TABLE "tests_result_suites_cases_gaps_recommendation_steps" CASCADE;
  DROP TABLE "tests_result_suites_cases_gaps" CASCADE;
  DROP TABLE "tests_result_suites_cases_overall_recommendations_dependencies" CASCADE;
  DROP TABLE "tests_result_suites_cases" CASCADE;
  DROP TABLE "tests_result" CASCADE;
  DROP TABLE "tests" CASCADE;
  DROP TABLE "tests_rels" CASCADE;
  DROP TABLE "input_files" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "dev_panel" CASCADE;`)
}
