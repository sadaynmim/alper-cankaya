import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const out='dist'; fs.rmSync(out,{recursive:true,force:true}); fs.mkdirSync(out,{recursive:true});
fs.copyFileSync('src/index.html',path.join(out,'index.html'));
fs.copyFileSync('src/interviews.html',path.join(out,'interviews.html'));
if(fs.existsSync('media')) fs.cpSync('media',path.join(out,'media'),{recursive:true});
// Decode the supplied gallery photographs from text-safe repository sources.
const gallerySource='media/gallery/uzak-sehir-behind-scenes';
if(fs.existsSync(gallerySource)) for(const file of fs.readdirSync(gallerySource).filter(f=>f.endsWith('.jpeg.b64'))){
 const photo=Buffer.from(fs.readFileSync(path.join(gallerySource,file),'utf8').trim(),'base64');
 if(photo.length<1000||photo[0]!==0xff||photo[1]!==0xd8)throw new Error('Invalid gallery photograph: '+file);
 fs.writeFileSync(path.join(out,gallerySource,file.slice(0,-4)),photo);
 fs.rmSync(path.join(out,gallerySource,file));
}
// Restore the uploaded Gaddar portrait from its text-safe source at build time.
const gaddarSource='media/gaddar-enver.webp.b64';
if(fs.existsSync(gaddarSource)){
  const photo=Buffer.from(fs.readFileSync(gaddarSource,'utf8').trim(),'base64');
  if(photo.length<1000||photo.toString('ascii',0,4)!=='RIFF'||photo.toString('ascii',8,12)!=='WEBP') throw new Error('Invalid Gaddar portrait');
  if(crypto.createHash('sha256').update(photo).digest('hex')!=='1e80771801211917f9261ffb7750165f33249076d73466b8818bebcb304a983d') throw new Error('Gaddar portrait integrity check failed');
  fs.writeFileSync(path.join(out,'media','gaddar-enver.webp'),photo);
}

const read=(f,def=null)=>fs.existsSync(f)?JSON.parse(fs.readFileSync(f,'utf8')):def;
const entries=(folder)=>fs.existsSync('content/'+folder)?fs.readdirSync('content/'+folder).filter(f=>f.endsWith('.json')).sort((a,b)=>a.localeCompare(b,'en',{numeric:true})).map(f=>({path:'content/'+folder+'/'+f,data:read('content/'+folder+'/'+f)})):[];
const cache=read('content/translations.tr.json',{entries:{}})?.entries||{};
function tr(file,field,en,legacy=''){
 if(!en)return legacy||'';
 const c=cache[file+':'+field];
 if(c?.source===en && c.translation)return c.translation;
 if(c?.source && c.source!==en)return en;
 return legacy||en;
}
const works=entries('works').map(({path:file,data:w})=>{const en=w.description_en||w.description?.en||'';return {...w,description:{en,tr:tr(file,'description_en',en,w.description_tr||w.description?.tr||'')}}}).sort((a,b)=>{const year=w=>w.year==='Upcoming'?2026:Number((w.year||'').match(/\d{4}/)?.[0]||0);return year(b)-year(a);});
const gallery=entries('gallery').map(v=>v.data).filter(g=>!g.hidden);
const videos=read('content/videos.json',{}).items||[];
const bio=read('content/bio.json',{});
const site=read('content/site.json',{});
const awards=entries('awards').map(({path:file,data:a})=>{for(const field of ['title','competition','festival'])a[field+'_tr']=tr(file,field+'_en',a[field+'_en'],a[field+'_tr']||'');return a;}).sort((a,b)=>Number(b.year)-Number(a.year));
for(const field of Object.keys(bio).filter(k=>/^p\d+_en$/.test(k))){const target=field.replace(/_en$/,'_tr');bio[target]=tr('content/bio.json',field,bio[field],bio[target]||'');}
const news=entries('news').map(({path:file,data:n})=>{for(const p of ['title','description']){const en=n[p+'_en']||'';n[p+'_tr']=tr(file,p+'_en',en,n[p+'_tr']||'');}return n;});
const legacyNews=read('content/news.json',{});
for(const p of ['title','description']){const en=legacyNews[p+'_en']||'';legacyNews[p+'_tr']=tr('content/news.json',p+'_en',en,legacyNews[p+'_tr']||'');}
fs.writeFileSync(path.join(out,'archive-content.js'),'window.ARCHIVE_CONTENT='+JSON.stringify({works,gallery,videos,bio,awards,news,legacyNews,site}).replace(/</g,'\\u003c')+';');
// Refresh cached content whenever the generated archive changes.
const contentVersion=crypto.createHash('sha256').update(fs.readFileSync(path.join(out,'archive-content.js'))).digest('hex').slice(0,12);
const homepage=path.join(out,'index.html');
fs.writeFileSync(homepage,fs.readFileSync(homepage,'utf8').replace('src="archive-content.js"','src="archive-content.js?v='+contentVersion+'"'));
console.log('Built '+works.length+' works, '+gallery.length+' photos, '+news.length+' articles. EN source / TR cache.');
