// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract UserDetails {
    // Struct to store user details
    struct User {
        string email;
        string did;
        bool isActive;
    }

    // Array to store user details
    User[] private userDetails;

    // Event to emit when user details are added
    event UserDetailsAdded(string email, string did);

    // Event to emit when user status is updated
    event UserStatusUpdated(string did, bool isActive);

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

        // Add user details to the array
        userDetails.push(User(email, did, true));

        // Emit event
        emit UserDetailsAdded(email, did);
    }

    // Function to get user details by email
    function getUserDetailsByEmail(string memory email) external view returns (string memory, bool) {
        // Iterate through the array to find the user's DID and status
        for (uint256 i = 0; i < userDetails.length; i++) {
            if (keccak256(bytes(userDetails[i].email)) == keccak256(bytes(email))) {
                return (userDetails[i].did, userDetails[i].isActive);
            }
        }

        // Return empty string and false if email is not found
        return ("", false);
    }

    // Function to get a list of all emails, DIDs, and statuses present in the array
    function getAllUserDetails() external view returns (string[] memory, string[] memory, bool[] memory) {
        uint256 length = userDetails.length;

        // Create arrays to store emails, DIDs, and statuses
        string[] memory emails = new string[](length);
        string[] memory dids = new string[](length);
        bool[] memory statuses = new bool[](length);

        // Populate the arrays with user details
        for (uint256 i = 0; i < length; i++) {
            emails[i] = userDetails[i].email;
            dids[i] = userDetails[i].did;
            statuses[i] = userDetails[i].isActive;
        }

        return (emails, dids, statuses);
    }

    // Function to get email and status by DID
    function getEmailAndStatusByDid(string memory did) external view returns (string memory, bool) {
        // Iterate through the array to find the user's email and status by DID
        for (uint256 i = 0; i < userDetails.length; i++) {
            if (keccak256(bytes(userDetails[i].did)) == keccak256(bytes(did))) {
                return (userDetails[i].email, userDetails[i].isActive);
            }
        }

        // Return empty string and false if DID is not found
        return ("", false);
    }

    // Function to update status by DID (only callable by the owner)
    function updateStatus(string memory did, bool newStatus) external onlyOwner {
        // Iterate through the array to find the user by DID
        for (uint256 i = 0; i < userDetails.length; i++) {
            if (keccak256(bytes(userDetails[i].did)) == keccak256(bytes(did))) {
                userDetails[i].isActive = newStatus;

                // Emit event
                emit UserStatusUpdated(did, newStatus);

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
