-- Use the poe_market_tracker database
USE poe_market_tracker;

-- Disable foreign key checks to allow truncating tables with foreign keys
SET FOREIGN_KEY_CHECKS = 0;

-- Truncate the leagues table and reset the auto-increment counter
TRUNCATE TABLE leagues;

-- Truncate the currencies table and reset the auto-increment counter
TRUNCATE TABLE currencies;

-- Enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;