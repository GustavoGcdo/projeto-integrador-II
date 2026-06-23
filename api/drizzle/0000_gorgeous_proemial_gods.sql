CREATE TABLE "addresses" (
	"id" serial PRIMARY KEY NOT NULL,
	"street" varchar(180) NOT NULL,
	"number" varchar(40) NOT NULL,
	"district" varchar(120) NOT NULL,
	"city" varchar(120) NOT NULL,
	"state" varchar(2) NOT NULL,
	"zip_code" varchar(12),
	"latitude" varchar(30),
	"longitude" varchar(30)
);
--> statement-breakpoint
CREATE TABLE "dropoff_point_waste_types" (
	"dropoff_point_id" integer NOT NULL,
	"waste_type_id" integer NOT NULL,
	"note" text,
	"active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "dropoff_point_waste_types_dropoff_point_id_waste_type_id_pk" PRIMARY KEY("dropoff_point_id","waste_type_id")
);
--> statement-breakpoint
CREATE TABLE "dropoff_points" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(180) NOT NULL,
	"description" text,
	"phone" varchar(30),
	"opening_hours" text,
	"status" varchar(40) DEFAULT 'active' NOT NULL,
	"validation_status" varchar(40) DEFAULT 'validated' NOT NULL,
	"address_id" integer NOT NULL,
	"source_suggestion_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suggestions" (
	"id" serial PRIMARY KEY NOT NULL,
	"kind" varchar(40) NOT NULL,
	"status" varchar(40) DEFAULT 'pending' NOT NULL,
	"place_name" varchar(180) NOT NULL,
	"address_text" text NOT NULL,
	"district_text" varchar(120) NOT NULL,
	"city_text" varchar(120) NOT NULL,
	"waste_type_text" varchar(180) NOT NULL,
	"opening_hours_text" text,
	"note" text,
	"reference_point_id" integer,
	"reviewed_by_user_id" integer,
	"generated_point_id" integer,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(160) NOT NULL,
	"email" varchar(180) NOT NULL,
	"password_hash" text NOT NULL,
	"role" varchar(40) DEFAULT 'admin' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "waste_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"description" text,
	"disposal_guidance" text,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dropoff_point_waste_types" ADD CONSTRAINT "dropoff_point_waste_types_dropoff_point_id_dropoff_points_id_fk" FOREIGN KEY ("dropoff_point_id") REFERENCES "public"."dropoff_points"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dropoff_point_waste_types" ADD CONSTRAINT "dropoff_point_waste_types_waste_type_id_waste_types_id_fk" FOREIGN KEY ("waste_type_id") REFERENCES "public"."waste_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dropoff_points" ADD CONSTRAINT "dropoff_points_address_id_addresses_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suggestions" ADD CONSTRAINT "suggestions_reference_point_id_dropoff_points_id_fk" FOREIGN KEY ("reference_point_id") REFERENCES "public"."dropoff_points"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suggestions" ADD CONSTRAINT "suggestions_reviewed_by_user_id_users_id_fk" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "dropoff_points_address_id_idx" ON "dropoff_points" USING btree ("address_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "waste_types_name_idx" ON "waste_types" USING btree ("name");