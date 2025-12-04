-- MarketPro AI Database Initialization Script
-- This script will be executed when PostgreSQL container starts

-- Create database if not exists (usually handled by Docker environment)
-- CREATE DATABASE marketpro;

-- Connect to the database
\connect marketpro;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create indexes for better performance (will be created by Prisma migrations)
-- These are just examples of what Prisma will create

-- Index on user email for fast login
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON "User"(email);

-- Index on task status for monitoring
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_status ON "Task"(status);

-- Index on project user for user queries
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_user ON "Project"("userId");

-- Index on heartbeats for cleanup
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_heartbeats_timestamp ON "TaskHeartbeat"(timestamp);

-- Create some initial data (optional)
-- This will be handled by the application seeding scripts

-- Log initialization
INSERT INTO "migrations" (name, applied_at)
VALUES ('01-init', NOW())
ON CONFLICT (name) DO NOTHING;