const express = require('express');
const { signTransaction,relayTransaction } = require('../services/trxService');
const ethers = require('ethers');
const jwt = require('jsonwebtoken');


function stringToBytes32(str) {
  return ethers.utils.id(str);
}

function initializeRoutes(app,web3, userManagerContract, voterManagerContract, USER_MANAGER_ADDRESS, VOTER_MANAGER_ADDRESS, SIGNER_BASE_URL, RELAYER_BASE_URL) {


  // Handle POST requests to /addUser
  app.post("/university/createElection", async (req, res) => {
    try {
      const {
        electionTitle,
        electionDescription,
        electionStartDate,
        electionEndDate,
        password,
      } = req.body;

      //later save fName,lastName,dob,email,university with respect to userId via offchain db
      const universityId=stringToBytes32(electionTitle);//take from jwt
      let electionIdCount;
      electionIdCount++
      const electionId = stringToBytes32(electionIdCount);//fetch from backend
      
      const positionsDetailsId=[]

      // Extract the authorization token from the request headers
      const bearerToken = req.headers.authorization;

      if (!bearerToken || !bearerToken.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Extract the JWT token (remove 'Bearer ' from the token string)
      const token = bearerToken.split(" ")[1];

       // Verify and decode the JWT token
       const decoded=jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
          return res.status(401).json({ error: "Unauthorized" });
        }
        else{
          return decoded
        }
      });

      // Now, you can access the walletAddress from the decoded JWT payload
      const walletAddress = decoded.walletAddress;
      // Fetch nonce from Ethereum network
      const nonce = await web3.eth.getTransactionCount(walletAddress);
        let Election = {
            universityId: universityId,
            electionId:electionId,
            startingTime: electionStartDate,
            endingTime: electionEndDate,
            positionsDetailsId: [
                          "0x766f746572320000000000000000000000000000000000000000000000000000",
                          "0x766f746572330000000000000000000000000000000000000000000000000000",
                      ],
          }

      const addElectionEncodedAbi = voterManagerContract.methods
        .addElection(Election)
        .encodeABI();

      // Calculate the message hash locally
      const encodedParams = ethers.utils.solidityPack(
        ["address", "bytes", "uint256"],
        [VOTER_MANAGER_ADDRESS, addElectionEncodedAbi, nonce]
      );

      // Sign the transaction
      const signature = await signTransaction(
        encodedParams,
        password,
        bearerToken,
        SIGNER_BASE_URL
      );
      console.log(signature);

      // Relay the transaction
      const relayedTransactionDetails = await relayTransaction(
        VOTER_MANAGER_ADDRESS,
        addElectionEncodedAbi,
        signature.signatureInfo,
        RELAYER_BASE_URL
      );

      // Respond to the client
      res
        .status(200)
        .json({
          message: "Create Election trx successfully relayed",
          details: relayedTransactionDetails,
          electionIdCount:electionIdCount,
        });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

    // Define a new GET route for /university/getAllOfficers/:universityid
  app.get('/university/getAllOfficers/:universityid', async (req, res) => {
      try {
        // Replace this with your actual logic to fetch officer data based on the ID
        const officerData = [
          {
            officerId: 1,
            name: 'John Doe',
            role: 'President',
          },
          {
            officerId: 2,
            name: 'Jane Smith',
            role: 'Vice President',
          },
          // Add more officer data as needed
        ];
  
        // Respond with the officer data as JSON
        res.status(200).json(officerData);
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

 
}

module.exports = {
  initializeRoutes,
};
