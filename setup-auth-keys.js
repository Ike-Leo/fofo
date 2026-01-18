/* eslint-disable */
const crypto = require('crypto');
const fs = require('fs');
const { execSync } = require('child_process');

const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

// Write keys to temp files
fs.writeFileSync('private.key', privateKey);
fs.writeFileSync('public.key', publicKey);

console.log('Keys generated and saved to private.key and public.key');
console.log('');
console.log('To set them in Convex, run these commands in PowerShell:');
console.log('');
console.log('$priv = Get-Content private.key -Raw');
console.log('npx convex env set JWT_PRIVATE_KEY $priv');
console.log('');
console.log('$pub = Get-Content public.key -Raw');
console.log('npx convex env set JWT_PUBLIC_KEY $pub');
