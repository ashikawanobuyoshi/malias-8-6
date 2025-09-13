import fs from 'fs';
import path from 'path';

const src = path.resolve('./static/kuroco_front.json');
const dest = path.resolve('./.output/public/kuroco_front.json');

fs.copyFileSync(src, dest);
console.log('Copied kuroco_front.json to .output/public');