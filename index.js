const express = require("express");
const mongoose = require('mongoose');
const dotenv = require("dotenv");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const { Web3 } = require("web3");
const userManagerABI = require("./blockchain/abi/userManager.json");
const userStorageABI = require("./blockchain/abi/userStorage.json");
const votingCommonABI = require("./blockchain/abi/votingCommon.json");
const votingStorageABI = require("./blockchain/abi/votingStorage.json");
const voterManagerABI = require("./blockchain/abi/userStorage.json");

const userRoutes = require("./routes/userRoutes");

dotenv.config();

const app = express();
app.use(cors()); // Enable CORS middleware

const port = process.env.PORT || 8002;

const USER_MANAGER_ADDRESS = process.env.USER_MANAGER_ADDRESS;
const VOTER_MANAGER_ADDRESS = process.env.VOTER_MANAGER_ADDRESS;
const SIGNER_BASE_URL = process.env.SIGNER_BASE_URL;
const RELAYER_BASE_URL = process.env.RELAYER_BASE_URL;
const WEB3_PROVIDER_URL = process.env.WEB3_PROVIDER_URL
const uri = process.env.MONGO_URI;




mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
});


const web3 = new Web3(
  new Web3.providers.HttpProvider(WEB3_PROVIDER_URL)
);

app.use(express.json());

app.use('/user', userRoutes);  // This mounts all routes from userRoutes.js under the '/user' path

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
