# Path of Exile Market Tracker

This project is a market tracker for Path of Exile, allowing users to fetch prices for various currencies and items in different leagues.

## Prerequisites

- Node.js
- npm
- MySQL

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/poe-market-tracker.git
    cd poe-market-tracker
    ```

2. Install the dependencies:
    ```sh
    npm install
    ```

3. Create a [.env](http://_vscodecontentref_/2) file in the root directory and add your database configuration:
    ```env
    DB_HOST=your_database_host
    DB_USER=your_database_user
    DB_PASSWORD=your_database_password
    DB_NAME=poe_market_tracker
    ```

4. Run the SQL script to create the database and tables:
    ```sh
    mysql -u your_database_user -p your_database_password poe_market_tracker < scripts/create_database.sql
    ```

## Usage

1. Start the server:
    ```sh
    npm start
    ```

2. The server will be running on `http://localhost:3000`.

## Endpoints

### Get Prices for a Currency

- **URL:** `/api/prices/:short_name`
- **Method:** `GET`
- **Query Parameters:**
  - [league_id](http://_vscodecontentref_/3) (optional): The ID of the league to search in. If not provided, the default league is `Standard`.

- **Example:**
  - Get prices for Divine Orbs in the Standard league:
    ```sh
    GET /api/prices/divine
    ```
  - Get prices for Divine Orbs in a specific league:
    ```sh
    GET /api/prices/divine?league_id=1
    ```

## NPM Modules

The following npm modules are used in this project:

- [express](http://_vscodecontentref_/4): Fast, unopinionated, minimalist web framework for Node.js
- [https](http://_vscodecontentref_/5): Node.js module for making HTTPS requests
- `mysql2/promise`: MySQL client for Node.js with Promise support
- `dotenv`: Loads environment variables from a [.env](http://_vscodecontentref_/6) file into [process.env](http://_vscodecontentref_/7)

## License

This project is licensed under the MIT License.