CREATE TABLE `images_projects` (
	`id` integer,
	`img_name` text NOT NULL,
	FOREIGN KEY (`id`) REFERENCES `projectes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `projectes` (
	`id` integer PRIMARY KEY NOT NULL,
	`project_desc` text NOT NULL,
	`  project_date` text DEFAULT '2024'
);
