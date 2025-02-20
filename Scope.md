# Path of Exile Currency Tracker

## Table of Contents
1. [Define the Scope and Requirements](#1-define-the-scope-and-requirements)
2. [Set Up the Development Environment](#2-set-up-the-development-environment)
3. [Design the Database Schema](#3-design-the-database-schema)
4. [Set Up the MySQL Database](#4-set-up-the-mysql-database)
5. [Understand the Path of Exile Trade API](#5-understand-the-path-of-exile-trade-api)
6. [Plan the Data Fetching Logic](#6-plan-the-data-fetching-logic)
7. [Set Up the Web Server](#7-set-up-the-web-server)
8. [Implement the Data Fetching Script](#8-implement-the-data-fetching-script)
9. [Build the Frontend (Optional)](#9-build-the-frontend-optional)
10. [Test and Debug](#10-test-and-debug)
11. [Deploy the Application](#11-deploy-the-application)
12. [Monitor and Maintain](#12-monitor-and-maintain)
13. [Tools and Libraries You’ll Need](#13-tools-and-libraries-youll-need)

## 1. Define the Scope and Requirements

### List of Currencies
Identify all the currencies you want to track (e.g., Divine Orb, Exalted Orb, Mirror of Kalandra, etc.).

### Leagues to Track
Decide which leagues to include (e.g., Settlers, Settlers HC, Settlers SSF, Settlers SSFHC).

### Data to Store
Determine what data to store (e.g., currency name, league, price in Chaos Orbs, timestamp).

### Update Frequency
Decide how often to fetch and update the data (e.g., every 5 minutes, hourly).

## 2. Set Up the Development Environment

### Install Node.js
Ensure Node.js is installed on your Raspberry Pi.

### Install MySQL
Set up a MySQL database on your Raspberry Pi or a remote server.

### Create a Project Directory
Organize your project files.

## 3. Design the Database Schema

### Tables
- **currencies**: Store metadata about currencies (e.g., currency ID, name).
- **leagues**: Store metadata about leagues (e.g., league ID, name).
- **prices**: Store price data (e.g., currency ID, league ID, price in Chaos Orbs, timestamp).

### Relationships
- **prices** should have foreign keys linking to **currencies** and **leagues**.

## 4. Set Up the MySQL Database

### Create the Database
Use a tool like `mysql` or `phpMyAdmin` to create the database.

### Create Tables
Write SQL scripts to create the **currencies**, **leagues**, and **prices** tables.

### Insert Static Data
Populate the **currencies** and **leagues** tables with the currencies and leagues you want to track.

## 5. Understand the Path of Exile Trade API

### API Endpoints
Familiarize yourself with the Trade API endpoints (e.g., /search, /fetch).

### Rate Limits
Understand the API rate limits and plan your requests accordingly.

### Authentication
Check if you need an API key (usually not required for public endpoints).

## 6. Plan the Data Fetching Logic

### Fetching Prices
- Loop through each league and currency.
- Use the Trade API to search for the currency and extract the Chaos Orb price.

### Handling Pagination
Decide how many listings to fetch per currency (e.g., top 10 listings).

### Error Handling
Plan for API errors, rate limits, and missing data.

## 7. Set Up the Web Server

### Choose a Framework
Use Express.js to create the web server.

### Define Routes
- **/api/prices**: Fetch and return the latest prices from the database.
- **/api/update-prices**: Trigger a manual update of prices (optional).

### Serve Static Files
If you want a frontend, serve HTML/CSS/JS files.

## 8. Implement the Data Fetching Script

### Scheduled Tasks
Use a library like `node-cron` to fetch prices at regular intervals.

### Database Integration
Write functions to insert fetched prices into the MySQL database.

### Logging
Log errors and successful updates for debugging.

## 9. Build the Frontend (Optional)

### Display Prices
Create a simple webpage or dashboard to display the latest prices.

### Charts
Use a library like Chart.js to visualize price trends over time.

### Filters
Allow users to filter by league or currency.

## 10. Test and Debug

### Test the API Calls
Ensure the Trade API requests are working as expected.

### Test Database Queries
Verify that data is being inserted and retrieved correctly.

### Handle Edge Cases
Test for scenarios like missing data or API errors.

## 11. Deploy the Application

### Run the Server
Start the Node.js server on your Raspberry Pi.

### Access Remotely
Ensure the server is accessible from your desktop or other devices on the network.

### Automate Startup
Set up the server to start automatically on boot (e.g., using systemd).

## 12. Monitor and Maintain

### Monitor Performance
Keep an eye on server performance and database size.

### Backup Data
Regularly back up the MySQL database.

### Update as Needed
Adapt to changes in the Path of Exile API or your requirements.

## 13. Tools and Libraries You’ll Need

### Backend
- Node.js
- Express.js
- `node-fetch` or native fetch (Node.js 18+)
- `mysql2` or `sequelize` (for MySQL integration)
- `node-cron` (for scheduled tasks)

### Frontend (Optional)
- HTML/CSS/JavaScript
- Chart.js (for visualizations)

### Database
- MySQL
- `phpMyAdmin` or another MySQL management tool
