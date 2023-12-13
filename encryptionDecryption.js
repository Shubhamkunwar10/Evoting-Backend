const crypto = require('crypto');
const EthCrypto = require('eth-crypto');

// Simulated IPFS data
const ipfsString = 'Your IPFS data goes here...';

// Generate a symmetric key for encryption
const symmetricKey = crypto.randomBytes(32); // 256-bit key

// Encrypt the IPFS data symmetrically using AES
const iv = crypto.randomBytes(16); // Initialization vector
const cipher = crypto.createCipheriv('aes-256-cbc', symmetricKey, iv);
let encryptedData = cipher.update(ipfsString, 'utf8', 'hex');
encryptedData += cipher.final('hex');


// Simulated identities for allowed users (public/private key pairs)
const allowedUsers = [
    {
        publicKey: 'd2318bc102196a8491710e366ed02a5ab9500d1f4c15472bfdcb79c2c604641bed1b029ede20060dfe6baa2b02fdf95157cf65eaebb178e058fa7de2c3226c46', // User 1 public key
        privateKey: '0xd8f5cc60ac0dcbb4bc922441c0aac21e7b171714c57463ae0ed1e7059fa5e2c5', // User 1 private key
    },
    {
        publicKey: 'f6098fc93e0ee557daafc074535aa8fc235016965bac55c2a9ed6f8fd46dda614c202416ac9d57c97044e456fe3f5dc4f9b52b287c113860b09cda8bed747e75', // User 2 public key
        privateKey: '0xbb5bbe0f8efc86e3286f465bd2e49dd09edda6b0c3419d88220dc5f1235d5497', // User 2 private key
    }
];


// Function to encrypt the symmetric key with each allowed user's public key
async function encryptSymmetricKey(user) {
    const encryptedKey = await EthCrypto.encryptWithPublicKey(
        user.publicKey,
        symmetricKey.toString('hex') // Convert symmetric key to string before encryption
    );

    return {
        publicKey: user.publicKey,
        encryptedKey: encryptedKey
    };
}





// Encrypt the symmetric key with each allowed user's public key
async function encryptKeys() {
    const encryptedPromises = allowedUsers.map(encryptSymmetricKey);
    const encryptedSymmetricKeyByUsers = await Promise.all(encryptedPromises);
    return encryptedSymmetricKeyByUsers;
}




// Function to decrypt the encrypted symmetric key using a private key
async function decryptSymmetricKey(privateKey, publicKey, encryptedKey) {
    const decryptedKey = await EthCrypto.decryptWithPrivateKey(
        privateKey,
        encryptedKey
    );

    console.log('Decrypted symmetric key:', decryptedKey);

    // Decrypt the data using the decrypted symmetric key
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(decryptedKey, 'hex'), iv);
    let decryptedData = decipher.update(encryptedData, 'hex', 'utf8');
    decryptedData += decipher.final('utf8');

    console.log('Decrypted data:', decryptedData);
}




// Run the encryption process and then decryption process
async function main() {
    const encryptedSymmetricKeyByUsers = await encryptKeys();
    console.log('Encrypted symmetric keys for allowed users:', encryptedSymmetricKeyByUsers);

    // Usage: Call decrypt function with one of the allowed private keys and the corresponding public key
    await decryptSymmetricKey(allowedUsers[1].privateKey, allowedUsers[1].publicKey, encryptedSymmetricKeyByUsers[1].encryptedKey); // Replace with desired user's keys
}

// Run the main function
main();
