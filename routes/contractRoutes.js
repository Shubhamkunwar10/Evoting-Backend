const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Accounts = require('web3-eth-accounts');
const Web3  = require("web3");
const Tx = require("ethereumjs-tx")
const router = express.Router();
const web3 = new Web3('https://polygon-mumbai.infura.io/v3/0f333401437149e28c3696b36eb02f93');


const contractRegistry = {
    "UserManager": {
        abi: require('../blockchain/abi/userManager.json'),
        address: '0xdEC5C3DF58aABFB98b7d0CDbB4c4cD101371c0d1'
    },
    "UserStorage": {
        abi: require('../blockchain/abi/userStorage.json'),
        address: '0xBA3c9490CF9BE56f76f73d70739c03A17ef162B2'
    },
    "VotingCommon": {
        abi: require('../blockchain/abi/votingCommon.json'),
        address: '0xDb2C605c21859Fbf8f82F6A40b5823B8568Cc9A0'
    },
    "VotingManager": {
        abi: require('../blockchain/abi/votingManager.json'),
        address: '0xD4807E7aEea683DCD4ba0658335C561302212Cd4'
    },
    "VotingStorage": {
        abi: require('../blockchain/abi/votingStorage.json'),
        address: '0x9EdC543e7f104e415B450453C4CF1Bf7FA9DfE86'
    },
    
};

router.post('/sendTransaction', async (req, res) => {
    try {
        const { contractName, methodName, parameters, userEmail } = req.body;

        // Fetch user details from the database
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        // Validate contract name
        if (!contractRegistry[contractName]) {
            return res.status(400).json({ error: 'Unknown contract name' });
        }

        const contractDetails = contractRegistry[contractName];
        const contractInstance = new web3.eth.Contract(contractDetails.abi, contractDetails.address);
        
        // Dynamically call the method using method name and parameters
        const encodedABI = contractInstance.methods[methodName](...parameters).encodeABI();
        
        const userPvtKey = user.privateKey.substring(2); // Fetching from database
        const privateKey = Buffer.from(userPvtKey, 'hex');
        const nonce = await web3.eth.getTransactionCount(user.publicKey);  

        const rawTx = {
            nonce: web3.utils.toHex(nonce),
            from: user.publicKey,
            to: contractDetails.address,
            gasLimit: '0x3d0900',
            gasPrice: web3.utils.toHex(web3.utils.toWei('30', 'gwei')),
            chainId: web3.utils.toHex(80001),
            data: encodedABI,
        };

        const tx = new Tx(rawTx, { 'chain': 'Mumbai Testnet' });
        tx.sign(privateKey);

        const serializedTx = tx.serialize();

        web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
        .on('receipt', (receipt) => {
            res.status(200).json({
                status: true,
                message: "Action Completed Successfully",
                receipt: receipt
            });
        })
        .on('error', (err) => {
            console.log(err.Error)
            res.status(500).json({ error: err.toString() });
        });

    } catch (e) {
        res.status(400).json({
            status: e.toString()
        });
    }
});


router.get("/fetchContractData", async (req, res, next) => {
    try {
      const { contractName, methodName, parameters } = req.query;
  
      // Validate and fetch contract details
      const contractDetails = contractRegistry[contractName];
      if (!contractDetails) {
        return res.status(400).json({ error: 'Unknown contract name' });
      }
  
      // Create contract instance
      const contractInstance = new web3.eth.Contract(
        contractDetails.abi,
        contractDetails.address
      );
  
      // Dynamically call the method
      const method = contractInstance.methods[methodName];
      if (!method) {
        return res.status(400).json({ error: 'Unknown method name' });
      }
  
      // If parameters are provided, spread them into the method call
      const result = await method(...(parameters || [])).call();
  
      // Return the result
      res.status(200).json({ data: result });
  
    } catch (e) {
      console.log(e);
      next(e);
    }
  });
  


module.exports = router;