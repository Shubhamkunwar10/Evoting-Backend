// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserDetails {
    // Struct to store user details
    struct User {
        string email;
        string did;
        bool isActive;
        uint256 timestamp;
    }

    // Array to store user details
    User[] private userDetails;

    // Event to emit when user details are added
    event UserDetailsAdded(string email, string did, uint256 timestamp);

    // Event to emit when user status is updated
    event UserStatusUpdated(string did, bool isActive, uint256 timestamp);

    // Owner address
    address private owner;

    // Modifier to restrict functions to only the owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    // Constructor to set the contract owner
    constructor() {
        owner = msg.sender;
    }

    // Function to add user details
    function addUserDetails(string memory email, string memory did) external {
        // Ensure the email is not already registered
        require(!_emailExists(email), "Email already registered");

        // Add user details to the array with the current timestamp
        userDetails.push(User(email, did, true, block.timestamp));

        // Emit event
        emit UserDetailsAdded(email, did, block.timestamp);
    }

    // Function to get user details by email
    function getUserDetailsByEmail(string memory email) external view returns (string memory, bool, uint256) {
        // Iterate through the array to find the user's DID, status, and timestamp
        for (uint256 i = 0; i < userDetails.length; i++) {
            if (keccak256(bytes(userDetails[i].email)) == keccak256(bytes(email))) {
                return (userDetails[i].did, userDetails[i].isActive, userDetails[i].timestamp);
            }
        }

        // Return empty string, false, and 0 if email is not found
        return ("", false, 0);
    }

    // Function to get a list of all emails, DIDs, statuses, and timestamps present in the array
    function getAllUserDetails() external view returns (string[] memory, string[] memory, bool[] memory, uint256[] memory) {
        uint256 length = userDetails.length;

        // Create arrays to store emails, DIDs, statuses, and timestamps
        string[] memory emails = new string[](length);
        string[] memory dids = new string[](length);
        bool[] memory statuses = new bool[](length);
        uint256[] memory timestamps = new uint256[](length);

        // Populate the arrays with user details
        for (uint256 i = 0; i < length; i++) {
            emails[i] = userDetails[i].email;
            dids[i] = userDetails[i].did;
            statuses[i] = userDetails[i].isActive;
            timestamps[i] = userDetails[i].timestamp;
        }

        return (emails, dids, statuses, timestamps);
    }

    // Function to get email, status, and timestamp by DID
    function getEmailStatusAndTimestampByDid(string memory did) external view returns (string memory, bool, uint256) {
        // Iterate through the array to find the user's email, status, and timestamp by DID
        for (uint256 i = 0; i < userDetails.length; i++) {
            if (keccak256(bytes(userDetails[i].did)) == keccak256(bytes(did))) {
                return (userDetails[i].email, userDetails[i].isActive, userDetails[i].timestamp);
            }
        }

        // Return empty string, false, and 0 if DID is not found
        return ("", false, 0);
    }

    // Function to update status by DID (only callable by the owner)
    function updateStatus(string memory did, bool newStatus) external onlyOwner {
        // Iterate through the array to find the user by DID
        for (uint256 i = 0; i < userDetails.length; i++) {
            if (keccak256(bytes(userDetails[i].did)) == keccak256(bytes(did))) {
                userDetails[i].isActive = newStatus;

                // Emit event with timestamp
                emit UserStatusUpdated(did, newStatus, block.timestamp);

                return;
            }
        }

        // Revert if DID is not found
        revert("DID not found");
    }

    // Internal function to check if an email already exists in the array
    function _emailExists(string memory email) internal view returns (bool) {
        for (uint256 i = 0; i < userDetails.length; i++) {
            if (keccak256(bytes(userDetails[i].email)) == keccak256(bytes(email))) {
                return true;
            }
        }
        return false;
    }
}
