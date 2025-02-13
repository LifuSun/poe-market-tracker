-- Use the poe_market_tracker database
USE poe_market_tracker;

-- Disable foreign key checks to allow dropping tables with foreign keys
SET FOREIGN_KEY_CHECKS = 0;

-- Drop the leagues table
DROP TABLE IF EXISTS leagues;

-- Drop the currencies table
DROP TABLE IF EXISTS currencies;

-- Enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;