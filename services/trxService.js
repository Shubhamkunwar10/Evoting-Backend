// transactionUtils.js
const axios = require('axios');

async function signTransaction(encodedParams, password, bearerToken, signerBaseUrl) {
  try {
    const signatureResponse = await axios.post(
      `${signerBaseUrl}/auth/signTransaction`,
      {
        password,
        encodedABIData: encodedParams,
        nonce: 0,
      },
      {
        headers: {
          Authorization: bearerToken,
          'Content-Type': 'application/json',
        },
      }
    );

    return signatureResponse.data.signedTransaction.signatureData;
  } catch (error) {
    throw error;
  }
}

async function relayTransaction(gaslessRelayerAddress, contractAddressToCall, encodedABIData, signatureData, relayerBaseUrl) {
  try {
    const relayResponse = await axios.post(`${relayerBaseUrl}/relay`, {
      gaslessRelayerAddress,
      contractAddressToCall,
      encodedABIData,
      signatureData,
      useFee: false,
    });

    return relayResponse.data;
  } catch (error) {
    throw error;
  }
}

module.exports = { signTransaction, relayTransaction };
