const express = require("express");
const dotenv = require("dotenv");
const { Web3 } = require("web3");
const cors = require('cors');
const userManagerABI = require("./abi/userManager.json");
const voterManagerABI = require("./abi/voterManager.json");
const gaslessRelayerABI = require("./abi/GaslessRelayer.json"); // Replace with the actual ABI file for GaslessRelayer

const initializeRoutes = require("./routes/addUser");
const initializeRoutesElection = require("./routes/addElection");
const initializeRoutesRelayer = require("./routes/addWhitelist");

 //update this so that only authorized jwtUser can Call this server

 //Save data to offchain


dotenv.config();

const app = express();
app.use(cors());

const port = process.env.PORT || 8002;

const USER_MANAGER_ADDRESS = process.env.USER_MANAGER_ADDRESS;
const VOTER_MANAGER_ADDRESS = process.env.VOTER_MANAGER_ADDRESS;
const GASLESS_RELAYER_ADDRESS = process.env.GASLESS_RELAYER_ADDRESS; // Get the address of the GaslessRelayer contract from your environment variables

const SIGNER_BASE_URL = process.env.SIGNER_BASE_URL;
const RELAYER_BASE_URL = process.env.RELAYER_BASE_URL;
const WEB3_PROVIDER_URL=process.env.WEB3_PROVIDER_URL

console.log(RELAYER_BASE_URL,SIGNER_BASE_URL)

const web3 = new Web3(
  new Web3.providers.HttpProvider(WEB3_PROVIDER_URL)
);

const userManagerContract = new web3.eth.Contract(
  userManagerABI,
  USER_MANAGER_ADDRESS
);

const voterManagerContract = new web3.eth.Contract(
  voterManagerABI,
  VOTER_MANAGER_ADDRESS
);

const gaslessRelayerContract  = new web3.eth.Contract(
  gaslessRelayerABI,
  GASLESS_RELAYER_ADDRESS
);

app.use(express.json());

// Initialize routes
initializeRoutes.initializeRoutes(app,web3, userManagerContract, USER_MANAGER_ADDRESS, SIGNER_BASE_URL,  RELAYER_BASE_URL);

initializeRoutesElection.initializeRoutes(app,web3,  voterManagerContract,  VOTER_MANAGER_ADDRESS, SIGNER_BASE_URL,  RELAYER_BASE_URL);

initializeRoutesRelayer.initializeRoutes(app,web3,  gaslessRelayerContract,  GASLESS_RELAYER_ADDRESS, SIGNER_BASE_URL,  RELAYER_BASE_URL);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
