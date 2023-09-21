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
                      ],
          }
          console.log(Election)

      const addElectionEncodedAbi = voterManagerContract.methods
        .addElection(Election, jwt.address)
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

  // Handle POST requests to /addUser
  app.post("/university/createPosition", async (req, res) => {
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
    // Define a new GET route for /university/getAllOfficers/:universityid
  app.get("/university/getElectionByUniversity/:universityid", async (req, res) => {
      try {
        // Replace this with your actual logic to fetch officer data based on the ID
        const electionData = [
          {
            electionId: 1,
            electionTitle: '2024 Colege Voting',
            totalAlumni: '22',
            electionStartDate: '10-11-2023',
            electionEndDate: '15-11-2023',
            electionStatus:"inProgress",

          },
          {
            electionId: 2,
            electionTitle: '2023 Mess Voting',
            totalAlumni: '8',
            electionStartDate: '10-11-2023',
            electionEndDate: '15-11-2023',
            electionStatus:"finished",

          },
          {
            electionId: 3,
            electionTitle: '2022 Mess Voting',
            totalAlumni: '8',
            electionStartDate: '10-11-2023',
            electionEndDate: '15-11-2023',
            electionStatus:"inactive",

          },
          ]
  
        // Respond with the officer data as JSON
        res.status(200).json(electionData);
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
  app.get("/university/getPositionForElection/:electionId", async (req, res) => {
      try {
        // Replace this with your actual logic to fetch officer data based on the ID
        const PositionData = [
          {
            electionId:1,
            positionId: 1,
            electionTitle: 'President',
            electionDescription:"President Position",
            totalAlumni: '22',
            electionStartDate: '10112023',
            electionEndDate: '15112025',
            electionStatus:"inProgress",

            electionType:""
          },
          {
            electionId:1,
            positionId: 2,
            electionTitle: 'Treasure',
            electionDescription:"Upcoming election to choose treasurer",
            totalAlumni: '8',
            electionStartDate: '13112028',
            electionEndDate: '19112028',
            electionStatus:"finished",
          },
          {
            electionId:1,
            positionId: 3,
            electionTitle: 'Vice-president',
            electionDescription:"",
            totalAlumni: '18',
            electionStartDate: '16112023',
            electionEndDate: '21112023',
            electionStatus:"inactive",
          },
          ]
  
        // Respond with the officer data as JSON
        res.status(200).json(PositionData);
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    // Define the GET request handler for /election/fetchAll
app.get('/systemAdmin/fetchAllElection', async (req, res) => {
  // Sample election data with date formatting and static values
const electionData = [
{
  id: 1,
  Designation: 'Election 1',
  totalCandidate: 13,
  totalAlumni: 256,
  dateCreated: formatDateToISO('2023-09-19T10:00:00.000Z'), // Static date value
  lastDate: formatDateToISO('2023-09-20T15:30:00.000Z'), // Static date value
  status: 'verified',
},
{
  id: 2,
  Designation: 'Election 2',
  totalCandidate: 9,
  totalAlumni: 654,
  dateCreated: formatDateToISO('2023-09-20T09:45:00.000Z'), // Static date value
  lastDate: formatDateToISO('2023-09-21T14:15:00.000Z'), // Static date value
  status: 'inProgress',
},
{
  id: 3,
  Designation: 'Election 3',
  totalCandidate: 5,
  totalAlumni: 383,
  dateCreated: formatDateToISO('2023-09-21T08:30:00.000Z'), // Static date value
  lastDate: formatDateToISO('2023-09-22T12:45:00.000Z'), // Static date value
  status: 'rejected',
},
];
try {
  // Respond with the election data as JSON
  res.status(200).json(electionData);
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({ error: 'Internal Server Error' });
}
});
    // Define the GET request handler for /university/fetchAllAlumni/:universityid
app.get('/university/fetchAllAlumni/:universityid', async (req, res) => {
  try {
    

    // Sample alumni data with date formatting
    const alumniData = [
      {
        id: 1,
        name: 'John Doe',
        age: 25,
        dateCreated: formatDateToISO('2023-09-19'),
        lastLogin: formatDateToISO('2023-09-20'),
        status: 'verified',
      },
      {
        id: 2,
        name: 'Jane Smith',
        age: 30,
        dateCreated: formatDateToISO('2023-09-18'),
        lastLogin: formatDateToISO('2023-09-21'),
        status: 'inProgress',
      },
      {
        id: 3,
        name: 'Bob Johnson',
        age: 28,
        dateCreated: formatDateToISO('2023-09-17'),
        lastLogin: formatDateToISO('2023-09-22'),
        status: 'rejected',
      },
    ];
    const { universityid } = req.params;

    // Respond with the alumni data as JSON
    res.status(200).json({ universityid, alumniData });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
  }); 








}


module.exports = {
  initializeRoutes,
};
