//  // Handle POST requests to /addVoter
//  app.post('/addVoter', async (req, res) => {
//     try {
//         const { voter, password } = req.body;
// // Log the voter object to debug
// console.log('voter:', voter);

//         // Extract the authorization token from the request headers
//         const bearerToken = req.headers.authorization;
    
//         if (!bearerToken || !bearerToken.startsWith('Bearer ')) {
//           return res.status(401).json({ error: 'Unauthorized' });
//         }
    
//         // Fetch nonce from Ethereum network
//         const nonce = await web3.eth.getTransactionCount('0x0A4d36d714004b305236C440a17B28BC9a14e622');
    
//         // Encode the ABI data for adding a voter (adjust this based on your contract's methods)
//         const addVoterEncodedAbi = userManagerContract.methods
//           .addVoter(voter) // Pass the entire voter object as a single parameter
//           .encodeABI();
    
//         // Calculate the message hash locally
//         const encodedParams = ethers.utils.solidityPack(
//           ['address', 'bytes', 'uint256'],
//           [VOTER_MANAGER_ADDRESS, addVoterEncodedAbi, nonce]
//         );
//       // Sign the transaction
//       const signature = await signTransaction(encodedParams, password, bearerToken, SIGNER_BASE_URL);
//       console.log(signature);

//       // Relay the transaction
//       const relayedTransactionDetails = await relayTransaction(
//         RELAYER_ADDRESS,
//         VOTER_MANAGER_ADDRESS,
//         addVoterEncodedAbi,
//         signature.signatureInfo,
//         RELAYER_BASE_URL
//       );

//       // Respond to the client
//       res.status(200).json({ message: 'Transaction Relayer for addVoter', details: relayedTransactionDetails });
//     } catch (error) {
//       console.error('Error:', error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//   });