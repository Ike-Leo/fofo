/* eslint-disable */
const crypto = require('crypto');

const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

console.log('JWT_PRIVATE_KEY:');
console.log(privateKey.replace(/\n/g, '\\n'));
console.log('');
console.log('JWT_PUBLIC_KEY:');
console.log(publicKey.replace(/\n/g, '\\n'));
