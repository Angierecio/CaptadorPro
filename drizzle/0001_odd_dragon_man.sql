CREATE TABLE `interactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int NOT NULL,
	`propertyId` int,
	`agentId` int NOT NULL,
	`type` enum('llamada','email','visita','whatsapp','reunion','nota','otro') DEFAULT 'nota',
	`subject` varchar(256),
	`content` text NOT NULL,
	`outcome` enum('positivo','neutral','negativo','sin_respuesta'),
	`nextAction` text,
	`nextActionDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `interactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyId` int,
	`ownerName` varchar(128) NOT NULL,
	`ownerPhone` varchar(32),
	`ownerEmail` varchar(320),
	`ownerType` enum('particular','agencia','promotora','banco') DEFAULT 'particular',
	`status` enum('nuevo','contactado','interesado','en_negociacion','captado','descartado','perdido') DEFAULT 'nuevo',
	`priority` enum('baja','media','alta','urgente') DEFAULT 'media',
	`source` varchar(64),
	`notes` text,
	`assignedAgentId` int,
	`nextContactDate` timestamp,
	`capturedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `properties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`externalId` varchar(128),
	`sourcePortal` varchar(64),
	`sourceUrl` text,
	`address` text,
	`city` varchar(128),
	`district` varchar(128),
	`postalCode` varchar(16),
	`province` varchar(64),
	`country` varchar(64) DEFAULT 'España',
	`latitude` decimal(10,7),
	`longitude` decimal(10,7),
	`propertyType` enum('piso','casa','chalet','local','oficina','garaje','terreno','nave','otro') DEFAULT 'piso',
	`operationType` enum('venta','alquiler','alquiler_vacacional') DEFAULT 'venta',
	`status` enum('nuevo','contactado','en_negociacion','captado','descartado','vendido') DEFAULT 'nuevo',
	`price` decimal(12,2),
	`pricePerSqm` decimal(10,2),
	`squareMeters` decimal(8,2),
	`squareMetersUseful` decimal(8,2),
	`rooms` int,
	`bathrooms` int,
	`floor` varchar(16),
	`hasElevator` boolean DEFAULT false,
	`hasParking` boolean DEFAULT false,
	`hasGarden` boolean DEFAULT false,
	`hasTerrace` boolean DEFAULT false,
	`hasPool` boolean DEFAULT false,
	`hasAirConditioning` boolean DEFAULT false,
	`energyCertificate` varchar(4),
	`yearBuilt` int,
	`condition` enum('nueva_construccion','buen_estado','a_reformar','reformado'),
	`title` text,
	`description` text,
	`features` json,
	`images` json,
	`ownerName` varchar(128),
	`ownerPhone` varchar(32),
	`ownerEmail` varchar(320),
	`ownerType` enum('particular','agencia','promotora','banco') DEFAULT 'particular',
	`assignedAgentId` int,
	`capturedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `properties_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `property_assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyId` int NOT NULL,
	`agentId` int NOT NULL,
	`assignedAt` timestamp NOT NULL DEFAULT (now()),
	`assignedByAgentId` int,
	`notes` text,
	CONSTRAINT `property_assignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scraping_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceId` int NOT NULL,
	`status` enum('pendiente','en_proceso','completado','error') DEFAULT 'pendiente',
	`propertiesFound` int DEFAULT 0,
	`propertiesNew` int DEFAULT 0,
	`propertiesDuplicated` int DEFAULT 0,
	`errorMessage` text,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`triggeredByAgentId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `scraping_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scraping_sources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`portal` enum('idealista','fotocasa','habitaclia','pisos_com','milanuncios','yaencontre','otro') NOT NULL,
	`baseUrl` text NOT NULL,
	`searchParams` json,
	`isActive` boolean NOT NULL DEFAULT true,
	`scheduleInterval` int DEFAULT 60,
	`lastRunAt` timestamp,
	`nextRunAt` timestamp,
	`createdByAgentId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scraping_sources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD `agency` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `avatarUrl` text;--> statement-breakpoint
ALTER TABLE `users` ADD `isActive` boolean DEFAULT true NOT NULL;