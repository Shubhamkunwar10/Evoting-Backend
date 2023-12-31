# Backend Server 

This is the production-ready backend server for the GaslessRelayer contract. It provides the necessary infrastructure to relay gasless transactions for smart contracts. Please ensure you follow the instructions below for proper setup and deployment.

## Getting Started

To get started with the backend server, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/C3I-blockchain/.git
   ```
2. Navigate to Project Directory:
   ```bash
     cd 
3. Install dependencies:
   ```bash
   npm install 
4. Configure Environment Variables:
    Create a .env file in the project directory and add the variables from env.example
 
5. Update Gasless Abi:
    If using own own Updated Contract provide new abi inside ./abi/ folder for Manager Contracts
 
6. Start the server in production mode::
    ```bash
    npm start

    Start the server after running Smart-Authentication Server (for signing) and Relayer server (to mine signed Tx) 
   
    Server is ready for Relaying gasless Transactions.

## Usage
The server is now up and running, relaying gasless transactions for the GaslessRelayer contract. Be cautious when using it in a production environment, and ensure you have a trusted relayer.
