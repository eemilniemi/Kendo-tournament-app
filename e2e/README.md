# Kendo Tournament App End-to-End (E2E) Tests 

This document provides instructions for running the End-to-End (E2E) tests for the Kendo Tournament Manager application.

### Prerequisites

- **Node.js** (v18.x or higher)
- **Docker**: Ensure Docker is installed and running.
- **MongoDB**: You need access to MongoDB, which can be set up using Docker.

## Running the tests

- If you want to run E2E tests on a specific database, you can add the following line to your /backend/server/.env file:
    ```bash
    E2E_MONGODB_URL="mongodb://127.0.0.1:27017/kendo_test"
    ```

- Start database with Docker
- Start backend server
- Start frontend

- Running the tests

    Install dependencies
    ```bash
    npm install
    ```
    Run the tests

    ```bash
    npm run test
    ```
