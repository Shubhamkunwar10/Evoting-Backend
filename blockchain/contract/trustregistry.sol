// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserDetails {
    // Struct to store user details
    struct User {
        string email;
        string did;
    }

    // Array to store user details
    User[] private userDetails;

    // Event to emit when user details are added
    event UserDetailsAdded(string email, string did);

    // Function to add user details
    function addUserDetails(string memory email, string memory did) external {
        // Ensure the email is not already registered
        require(!_emailExists(email), "Email already registered");

        // Add user details to the array
        userDetails.push(User(email, did));

        // Emit event
        emit UserDetailsAdded(email, did);
    }

    // Function to get user details by email
    function getUserDetailsByEmail(string memory email) external view returns (string memory) {
        // Iterate through the array to find the user's DID
        for (uint256 i = 0; i < userDetails.length; i++) {
            if (keccak256(bytes(userDetails[i].email)) == keccak256(bytes(email))) {
                return userDetails[i].did;
            }
        }

        // Return empty string if email is not found
        return "";
    }

    // Function to get a list of all emails and DIDs present in the array
    function getAllUserDetails() external view returns (string[] memory, string[] memory) {
        uint256 length = userDetails.length;

        // Create arrays to store emails and DIDs
        string[] memory emails = new string[](length);
        string[] memory dids = new string[](length);

        // Populate the arrays with user details
        for (uint256 i = 0; i < length; i++) {
            emails[i] = userDetails[i].email;
            dids[i] = userDetails[i].did;
        }

        return (emails, dids);
    }

    // Function to get email by DID
    function getEmailByDid(string memory did) external view returns (string memory) {
        // Iterate through the array to find the user's email by DID
        for (uint256 i = 0; i < userDetails.length; i++) {
            if (keccak256(bytes(userDetails[i].did)) == keccak256(bytes(did))) {
                return userDetails[i].email;
            }
        }

        // Return empty string if DID is not found
        return "";
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
