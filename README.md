# Path of Exile Currency Tracker

## Table of Contents
1. [Introduction](#introduction)
2. [Features](#features)
3. [Installation](#installation)
4. [Usage](#usage)
5. [Contributing](#contributing)
6. [License](#license)
7. [Acknowledgements](#acknowledgements)

## Introduction
Path of Exile Currency Tracker is a tool to track the prices of various currencies in the game Path of Exile. It fetches data from the Path of Exile Trade API and stores it in a MySQL database. This is built using Node.js for learning purposes. 

## Features
- Track prices of multiple currencies
- Support for multiple leagues
- Scheduled data fetching
- Web server to serve API endpoints
- [Optional] Frontend to display prices and trends

## Installation

### Prerequisites
- Node.js
- MySQL

### Steps
1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/poe-market-tracker.git
    cd poe-market-tracker
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Set up MySQL database:
    - Create a MySQL database.
    - Create tables for `currencies`, `leagues`, and `prices`.

4. Configure environment variables:
    - Create a `.env` file with your database credentials.

5. Start the application using nodemon:
    ```sh
    npx nodemon app.js
    ```

## Usage

### API Endpoints
- **/api/prices**: Fetch and return the latest prices from the database.
- **/api/update-prices**: Trigger a manual update of prices (optional).

### Scheduled Tasks
- Use `node-cron` to fetch prices at regular intervals.

## Contributing
Contributions are welcome! Please fork the repository and submit a pull request.

## License
This project is licensed under the MIT License.

## Acknowledgements
- Path of Exile Trade API
- Node.js
- Express.js
- MySQL
- `node-cron`
- Chart.js (for frontend visualizations)