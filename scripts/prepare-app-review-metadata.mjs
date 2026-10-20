import fs from 'node:fs';
import path from 'node:path';
const keys = path.resolve('../APIs/IOS');
process.env.ASC_KEY_ID = fs.readFileSync(path.join(keys,'Key ID.txt'),'utf8').trim();
process.env.ASC_ISSUER_ID = fs.readFileSync(path.join(keys,'Issuer ID.txt'),'utf8').trim();
process.env.ASC_PRIVATE_KEY_PATH = path.join(keys,'Coder Metadata App Manager.p8');
await import('./prepare-release-metadata.mjs');
