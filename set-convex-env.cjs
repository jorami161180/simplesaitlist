const { generateKeyPairSync } = require('crypto');
const { execSync } = require('child_process');

// 1. Generate a fresh PKCS#8 RSA key
const { privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
    }
});

// 2. Set the environment variable via Convex CLI
// We use a temporary file to avoid shell escape issues on Windows
const fs = require('fs');
fs.writeFileSync('temp_key.pem', privateKey);

try {
    console.log('Setting JWT_PRIVATE_KEY in Convex...');
    // The value needs to be the actual string. In many CLIs, redirecting stdin works better for multiline.
    execSync('npx convex env set JWT_PRIVATE_KEY -- "$(cat temp_key.pem)"', { shell: 'bash' });
    // If bash is not available, we might need a different approach.
    // Let's try a safer cross-platform way if possible.
} catch (e) {
    // Fallback for Windows CMD/PowerShell if bash redirect fails
    try {
        execSync(`npx convex env set JWT_PRIVATE_KEY "${privateKey.replace(/\n/g, '\\n')}"`);
    } catch (e2) {
        console.error('Failed to set env var:', e2.message);
    }
}

fs.unlinkSync('temp_key.pem');
console.log('Finished attempting to set JWT_PRIVATE_KEY.');
