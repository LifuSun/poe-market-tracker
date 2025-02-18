-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS poe_market_tracker;

-- Use the created database
USE poe_market_tracker;

-- Create the leagues table
CREATE TABLE IF NOT EXISTS leagues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    realm VARCHAR(50) NOT NULL,
    ladderUrl VARCHAR(255) NOT NULL,
    startAt DATETIME NOT NULL,
    endAt DATETIME,
    description TEXT,
    categoryId VARCHAR(255),
    categoryCurrent BOOLEAN,
    registerAt DATETIME NOT NULL,
    checkedAt DATETIME,
    updatedAt DATETIME
);

-- Create the currencies table
CREATE TABLE IF NOT EXISTS currencies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shortName VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    imageUrl VARCHAR(255) NOT NULL,
    checkedAt DATETIME,
    updatedAt DATETIME
);

-- Create the prices table
CREATE TABLE IF NOT EXISTS prices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    leagueId INT NOT NULL,
    wantCurrencyId INT NOT NULL,
    haveCurrencyId INT NOT NULL,
    upperQuartile DECIMAL(10, 2),
    lowerQuartile DECIMAL(10, 2),
    mode DECIMAL(10, 2),
    median DECIMAL(10, 2),
    mean DECIMAL(10, 2),
    lowest DECIMAL(10, 2),
    highest DECIMAL(10, 2),
    interQuartileRange DECIMAL(10, 2),
    iqtMode DECIMAL(10, 2),
    iqtMedian DECIMAL(10, 2),
    iqtMean DECIMAL(10, 2),
    FOREIGN KEY (leagueId) REFERENCES leagues(id),
    FOREIGN KEY (wantCurrencyId) REFERENCES currencies(id),
    FOREIGN KEY (haveCurrencyId) REFERENCES currencies(id)
);