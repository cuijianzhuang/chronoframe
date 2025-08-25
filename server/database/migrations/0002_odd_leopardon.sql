CREATE TABLE `photos` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text,
	`description` text,
	`width` integer,
	`height` integer,
	`aspect_ratio` text,
	`date_taken` integer,
	`storage_key` text,
	`file_size` integer,
	`last_modified` integer,
	`original_url` text,
	`thumbnail_url` text,
	`thumbnail_hash` text,
	`tags` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `photos_id_unique` ON `photos` (`id`);