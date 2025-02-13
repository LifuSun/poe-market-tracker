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

3. Create a [.env](http://_vscodecontentref_/4) file in the root directory and add your database configuration:
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

1. Start the server as a service:
    - Create a systemd service unit file:
        ```sh
        sudo nano /etc/systemd/system/poe-market-tracker.service
        ```

    - Add the following content to the `poe-market-tracker.service` file:
        ```ini
        [Unit]
        Description=Path of Exile Market Tracker Service
        After=network.target

        [Service]
        ExecStart=/usr/local/bin/node /var/www/poe-market-tracker/index.js
        WorkingDirectory=/var/www/poe-market-tracker
        Restart=on-failure
        User=your_username
        Environment=PATH=/usr/bin:/usr/local/bin
        Environment=NODE_ENV=production
        EnvironmentFile=/var/www/poe-market-tracker/.env
        StandardOutput=syslog
        StandardError=syslog
        SyslogIdentifier=poe-market-tracker

        [Install]
        WantedBy=multi-user.target
        ```

    - Reload systemd to recognize the new service unit file:
        ```sh
        sudo systemctl daemon-reload
        ```

    - Start the service:
        ```sh
        sudo systemctl start poe-market-tracker
        ```

    - Enable the service to start on boot:
        ```sh
        sudo systemctl enable poe-market-tracker
        ```

2. Schedule the [run-update.js](http://_vscodecontentref_/5) script to run at midnight every day:
    - Open the crontab editor:
        ```sh
        crontab -e
        ```

    - Add the following line to schedule the script to run at midnight every day:
        ```sh
        0 0 * * * /usr/local/bin/node /var/www/poe-market-tracker/run-update.js >> /var/www/poe-market-tracker/logs/updates.log 2>&1
        ```

## Endpoints

### Get Prices for a Currency

- **URL:** `/api/prices/:short_name`
- **Method:** `GET`
- **Query Parameters:**
  - `league_id` (optional): The ID of the league to search in. If not provided, the default league is `Standard`.

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

- `express`: Fast, unopinionated, minimalist web framework for Node.js
- `https`: Node.js module for making HTTPS requests
- `mysql2/promise`: MySQL client for Node.js with Promise support
- `dotenv`: Loads environment variables from a [.env](http://_vscodecontentref_/6) file into `process.env`

## License

This project is licensed under the MIT License.