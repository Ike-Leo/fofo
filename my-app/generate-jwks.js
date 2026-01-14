/* eslint-disable */
const crypto = require('crypto');
const fs = require('fs');

// Read the public key
const publicKeyPem = fs.readFileSync('public.key', 'utf8');

// Create a key object
const publicKey = crypto.createPublicKey(publicKeyPem);

// Export as JWK
const jwk = publicKey.export({ format: 'jwk' });

// Add required fields for JWKS
jwk.use = 'sig';
jwk.alg = 'RS256';
jwk.kid = 'default';

// Create JWKS (JSON Web Key Set)
const jwks = {
    keys: [jwk]
};

console.log('JWKS value to set in Convex Dashboard:');
console.log('');
console.log(JSON.stringify(jwks));
