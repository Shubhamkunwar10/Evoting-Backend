const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Accounts = require('web3-eth-accounts');
const Web3 = require("web3");
const Tx = require("ethereumjs-tx")
const router = express.Router();

const web3 = new Web3('https://polygon-amoy.blockpi.network/v1/rpc/public');
 

const contractRegistry = {
   
    "ssi_contract": {
        abi: require('../blockchain/abi/ssi_contract.json'),
        address: '0xb2760CF30ed217fCaaEEd85e68777140a16fCDD9'
    },
    "ssi_contract_2": {
        abi: require('../blockchain/abi/erc721_expiration.json'),
        address: '0xE629b27270625a93807aBbd649C73ca6C09CdD49'
    },
    // "SSIAccessControl" : {
    //     abi : require('../blockchain/abi/SSIAccessControl.json'),
    //     address : '0xF5bE93656aC614743D2AaE71DD5D640F9a7b2A15'
    // },
    "trustRegistry" : {
        abi : require('../blockchain/abi/trustRegistry.json'),
        address : "0x83B157093ed044A7517e0d40662d3faD0859284A"
    }
};

router.post('/sendTransaction', async (req, res) => {
    try {
        const { contractName, methodName, parameters, userEmail } = req.body;

        // Fetch user details from the database
        const user = await User.findOne({ email: userEmail });
        console.log(user)

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
        
        console.log(user)
        console.log(user.phoneNumber)
        // Ensure user.address is defined before proceeding
        if (!user.address) {
            return res.status(400).json({ error: 'logged in User address not found' });
        }
        
        const nonce = await web3.eth.getTransactionCount(user.address);

        const rawTx = {
            nonce: web3.utils.toHex(nonce),
            from: user.address,
            to: contractDetails.address,
            gasLimit: '0x3d0900',
            gasPrice: web3.utils.toHex(web3.utils.toWei('30', 'gwei')),
            chainId: web3.utils.toHex(80002),
            data: encodedABI,
        };

        const tx = new Tx(rawTx);
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
                res.status(500).json({ error: err.toString() });
            });

    } catch (e) {
        console.log(e);
        res.status(400).json({
            status: e.toString(),
        });
    }
});


router.get("/fetchContractData", async (req, res, next) => {
    try {
        const { contractName,methodName,parameters } = req.query;

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
        res.status(400).json({ error: e });
    }
});

// const methodName = 'fetchBalances';
// const parameters = [
//     ['0x1234567890123456789012345678901234567890', '0x514910771AF9Ca656af840dff83E8264EcF986CA'],
//     '0x1234567890123456789012345678901234567890' // Additional parameter if needed
// ];

module.exports = router;