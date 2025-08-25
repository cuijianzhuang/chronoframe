PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_photos` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text,
	`description` text,
	`width` integer,
	`height` integer,
	`aspect_ratio` integer,
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
INSERT INTO `__new_photos`("id", "title", "description", "width", "height", "aspect_ratio", "date_taken", "storage_key", "file_size", "last_modified", "original_url", "thumbnail_url", "thumbnail_hash", "tags", "exif") SELECT "id", "title", "description", "width", "height", "aspect_ratio", "date_taken", "storage_key", "file_size", "last_modified", "original_url", "thumbnail_url", "thumbnail_hash", "tags", "exif" FROM `photos`;--> statement-breakpoint
DROP TABLE `photos`;--> statement-breakpoint
ALTER TABLE `__new_photos` RENAME TO `photos`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `photos_id_unique` ON `photos` (`id`);