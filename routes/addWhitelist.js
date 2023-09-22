const express = require('express');
const { signTransaction,relayTransaction } = require('../services/trxService');
const ethers = require('ethers');
const jwt = require('jsonwebtoken');

let electionIdCount;

function stringToBytes32(str) {
  return ethers.utils.id(str);
}
function formatDateToISO(date) {
  return new Date(date).toISOString();
}

function initializeRoutes(app,web3,  gaslessRelayerContract,  GASLESS_RELAYER_ADDRESS, SIGNER_BASE_URL, RELAYER_BASE_URL) {




// Handle POST requests to add a position
app.post("/addToWhitelist", async (req, res) => {
  try {
    const {
        walletAddress,
      password,
    } = req.body;
    console.log(req.body)


    // Extract the authorization token from the request headers
    const bearerToken = req.headers.authorization;

    if (!bearerToken || !bearerToken.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Extract the JWT token (remove 'Bearer ' from the token string)
    const token = bearerToken.split(" ")[1];

    // Verify and decode the JWT token
    const decoded = jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: "Unauthorized" });
      } else {
        return decoded;
      }
    });


    // Fetch nonce from Ethereum network
    const nonce = await web3.eth.getTransactionCount(walletAddress);

    const applyForWhitelist = gaslessRelayerContract.methods
      .addToWhitelist(walletAddress)
      .encodeABI();
      console.log(applyForWhitelist)

    // Calculate the message hash locally
    const encodedParams = ethers.utils.solidityPack(
      ["address", "bytes", "uint256"],
      [GASLESS_RELAYER_ADDRESS, applyForWhitelist, nonce]
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
        GASLESS_RELAYER_ADDRESS,
        applyForWhitelist,
      signature.signatureInfo,
      RELAYER_BASE_URL
    );

    // Respond to the client
    res.status(200).json({
      message: "Position added successfully",
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
