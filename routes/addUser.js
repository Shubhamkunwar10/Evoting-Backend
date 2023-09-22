const express = require("express");
const { signTransaction, relayTransaction } = require("../services/trxService");
const ethers = require("ethers");
const jwt = require("jsonwebtoken");

function stringToBytes32(str) {
  return ethers.utils.id(str);
}

function initializeRoutes(
  app,
  web3,
  userManagerContract,
  voterManagerContract,
  USER_MANAGER_ADDRESS,
  VOTER_MANAGER_ADDRESS,
  SIGNER_BASE_URL,
  RELAYER_BASE_URL
) {
  // Handle POST requests to /addAlumni
  app.post("/university/addAlumni", async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        email,
        dob,
        universityId,
        userAddress,
        password,
      } = req.body;
      console.log(RELAYER_BASE_URL)

      //later save fName,lastName,dob,email,university with respect to userId via offchain db

      const userId = stringToBytes32(email);
      console.log("1")

      // Extract the authorization token from the request headers
      const bearerToken = req.headers.authorization;
      console.log("2",bearerToken)

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
      console.log("4")


      // Now, you can access the walletAddress from the decoded JWT payload
      const walletAddress = decoded.walletAddress;
      // Fetch nonce from Ethereum network
      const nonce = await web3.eth.getTransactionCount(walletAddress);

      // Encode the ABI data for adding a user
      const addUserEncodedAbi = userManagerContract.methods
        .addUser(userId, userAddress)
        .encodeABI();

      //later make a function to add userAddress by user themself 

      // Calculate the message hash locally
      const encodedParams = ethers.utils.solidityPack(
        ["address", "bytes", "uint256"],
        [USER_MANAGER_ADDRESS, addUserEncodedAbi, nonce]
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
        USER_MANAGER_ADDRESS,
        addUserEncodedAbi,
        signature.signatureInfo,
        RELAYER_BASE_URL
      );

      // Respond to the client
      res
        .status(200)
        .json({
          message: "User added trx successfully relayed",
          details: relayedTransactionDetails,
        });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
    // Handle POST requests to /addOfficer
    app.post("/university/addOfficer", async (req, res) => {
      try {
        const {
          email,
          role,
          designation,
          password,
          university
        } = req.body;
        console.log(req.body)
  
        const userId = stringToBytes32(email);
        console.log(1)

        const roles= [1, 2, 3, 4, 5, 6,role]

        let newMember = {
          memberId: userId,
          roles,
          designation
        };
  
        // Extract the authorization token from the request headers
        const bearerToken = req.headers.authorization;
  
        if (!bearerToken || !bearerToken.startsWith("Bearer ")) {
          return res.status(401).json({ error: "Unauthorized" });
        }
        console.log(2)
  
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
  
        // Encode the ABI data for adding a user
        const addUserEncodedAbi = userManagerContract.methods
          .addMember(newMember)
          .encodeABI();

          console.log(4)
  
        //later make a function to add userAddress by user themself 
  
        // Calculate the message hash locally
        const encodedParams = ethers.utils.solidityPack(
          ["address", "bytes", "uint256"],
          [USER_MANAGER_ADDRESS, addUserEncodedAbi, nonce]
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
          USER_MANAGER_ADDRESS,
          addUserEncodedAbi,
          signature.signatureInfo,
          RELAYER_BASE_URL
        );
  
        // Respond to the client
        res
          .status(200)
          .json({
            message: "Member Added trx successfully relayed",
            details: relayedTransactionDetails,
          });
      } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

}

module.exports = {
  initializeRoutes,
};
