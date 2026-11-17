import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'path';
const BE='/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const frames=process.argv.slice(2).map(Number);
const url=await bundle({entryPoint:path.resolve('src/index.ts')});
const comp=await selectComposition({serveUrl:url,id:'Promo',browserExecutable:BE});
for(const fr of frames){await renderStill({serveUrl:url,composition:comp,frame:fr,output:`out/f${String(fr).padStart(4,'0')}.png`,browserExecutable:BE,imageFormat:'png'});}
console.log('ok',comp.durationInFrames);
