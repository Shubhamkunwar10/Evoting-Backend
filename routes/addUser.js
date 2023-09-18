const express = require('express');
const { signTransaction,relayTransaction } = require('../services/trxService');
const ethers = require('ethers');
const jwt = require('jsonwebtoken');



function initializeRoutes(app,web3, userManagerContract, voterManagerContract, USER_MANAGER_ADDRESS, VOTER_MANAGER_ADDRESS, SIGNER_BASE_URL, RELAYER_BASE_URL) {
  // Handle POST requests to /addUser
  app.post('/addUser', async (req, res) => {
    try {
      const { userId, userAddress, password , } = req.body;

  // Extract the authorization token from the request headers
  const bearerToken = req.headers.authorization;

  if (!bearerToken || !bearerToken.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Extract the JWT token (remove 'Bearer ' from the token string)
  const token = bearerToken.split(' ')[1];

  // Verify and decode the JWT token
  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  })

    // Now, you can access the walletAddress from the decoded JWT payload
    const walletAddress = decoded.walletAddress;
      // Fetch nonce from Ethereum network
      const nonce = await web3.eth.getTransactionCount(walletAddress);

      // Encode the ABI data for adding a user
      const addUserEncodedAbi = userManagerContract.methods
        .addUser(userId, userAddress)
        .encodeABI();

      // Calculate the message hash locally
      const encodedParams = ethers.utils.solidityPack(
        ['address', 'bytes', 'uint256'],
        [USER_MANAGER_ADDRESS, addUserEncodedAbi, nonce]
      );

      // Sign the transaction
      const signature = await signTransaction(encodedParams, password, bearerToken, SIGNER_BASE_URL);
      console.log(signature);

      // Relay the transaction
      const relayedTransactionDetails = await relayTransaction(
        USER_MANAGER_ADDRESS,
        addUserEncodedAbi,
        signature.signatureInfo,
        RELAYER_BASE_URL
      );

      // Respond to the client
      res.status(200).json({ message: 'User added trx successfully relayed', details: relayedTransactionDetails });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

 
}

module.exports = {
  initializeRoutes,
};
