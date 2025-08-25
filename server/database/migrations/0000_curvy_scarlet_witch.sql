CREATE TABLE `photos` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text,
	`description` text,
	`width` integer,
	`height` integer,
	`aspect_ratio` real,
	`date_taken` text,
	`storage_key` text,
	`file_size` integer,
	`last_modified` text,
	`original_url` text,
	`thumbnail_url` text,
	`thumbnail_hash` text,
	`tags` text,
	`exif` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `photos_id_unique` ON `photos` (`id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password` text,
	`avatar` text,
	`created_at` integer NOT NULL,
	`is_admin` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_name_unique` ON `users` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);

--> statement-breakpoint
INSERT INTO users (name, email, password, avatar, created_at, is_admin) VALUES
  ('HoshinoSuzumi', 'master@uniiem.com', '$scrypt$n=16384,r=8,p=1$QaLKQI/LB+Kh7jgyeH4lGw$NuoxPwPvDZGK3F9oTNEgUNMAi24z/Wei6hWnJzNdscwKDHpQQVJfL1BlcNC+gHJtdJn4YsmQ9tWbVOCE4RgL1g', NULL, strftime('%s', 'now'), 1);