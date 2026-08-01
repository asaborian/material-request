CREATE TABLE "requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"status" text NOT NULL,
	"annual_quantity" integer,
	"reason" text,
	"new_item_name" text,
	"new_item_specification" text,
	"new_item_package_unit" text,
	"new_item_unit" text,
	"new_item_package_price" integer,
	"new_item_quantity_per_package" integer,
	"new_item_unit_price" integer,
	"has_existing_item" boolean,
	"existing_item_name" text,
	"existing_item_specification" text,
	"existing_item_package_unit" text,
	"existing_item_unit" text,
	"existing_item_package_price" integer,
	"existing_item_quantity_per_package" integer,
	"existing_item_unit_price" integer,
	"is_cheaper_or_equal" boolean,
	"unit_price_difference" integer,
	"has_discontinued_item" boolean,
	"discontinued_item_name" text,
	"discontinued_item_specification" text,
	"is_exempt_from_presentation" boolean,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "requests" ADD CONSTRAINT "requests_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");