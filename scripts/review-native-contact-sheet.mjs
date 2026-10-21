// QA-only thumbnails; never upload these derivative sheets as store screenshots.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
const [run,device]=process.argv.slice(2);
const images=[];
for(const lang of ['spanish','english']) {
 const folder=`artifacts/native-qa-${run}-${device}/captures/${device}-${lang}`;
 const entries=JSON.parse(fs.readFileSync(`${folder}/manifest.json`,'utf8')).flatMap(t=>t.attachments);
 for(const num of ['23-gallery-shop','20-gallery-lists','21-gallery-products','22-gallery-home']) {
  const entry=entries.find(e=>e.suggestedHumanReadableName.includes(num));
  images.push(await sharp(path.join(folder,entry.exportedFileName)).resize({width:400}).toBuffer());
 }
}
const size=await sharp(images[0]).metadata();
const target=`artifacts/app-review-20261020/${device}-gallery-contact.png`;
await sharp({create:{width:1600,height:size.height*2,channels:3,background:'#dedede'}}).composite(images.map((input,i)=>({input,left:(i%4)*400,top:Math.floor(i/4)*size.height}))).png().toFile(target);
console.log(target);
