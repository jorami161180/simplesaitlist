const { generateKeyPairSync } = require('crypto');
const fs = require('fs');
const path = require('path');

// 1. Generate a fresh PKCS#8 RSA key
const { privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
    }
});

// 2. Prepare the auth.ts content
const authContent = `import Google from "@auth/core/providers/google";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

// Hardcoded PKCS#8 RSA Private Key for local development
const LOCAL_JWT_KEY = ${JSON.stringify(privateKey)};

// Force the environment variable to be set correctly
process.env.JWT_PRIVATE_KEY = LOCAL_JWT_KEY;

export const { auth, signIn, signOut, store } = convexAuth({
    providers: [
        ...(process.env.AUTH_GOOGLE_ID ? [Google] : []),
        Password,
    ],
});
`;

// 3. Write to convex/auth.ts
fs.writeFileSync(path.join(__dirname, 'convex', 'auth.ts'), authContent);
console.log('Successfully wrote convex/auth.ts with a fresh hardcoded key.');
