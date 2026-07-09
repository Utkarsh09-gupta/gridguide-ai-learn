CREATE TABLE `topics` (
	`id` text PRIMARY KEY NOT NULL,
	`module_id` text NOT NULL,
	`index` integer NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`time_to_read` text NOT NULL,
	FOREIGN KEY (`module_id`) REFERENCES `modules`(`id`) ON UPDATE no action ON DELETE no action
);
