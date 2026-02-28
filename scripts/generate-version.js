import fs from 'fs';
import crypto from 'crypto';

const hash = crypto.randomBytes(8).toString('hex');
const version = { hash, buildTime: new Date().toISOString() };

fs.writeFileSync('public/version.json', JSON.stringify(version));
console.log(`Generated version.json with hash: ${hash}`);
