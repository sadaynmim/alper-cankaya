import fs from 'node:fs';
import path from 'node:path';
const out='dist'; fs.rmSync(out,{recursive:true,force:true}); fs.mkdirSync(out,{recursive:true});
fs.copyFileSync('src/index.html',path.join(out,'index.html'));
if(fs.existsSync('media')) fs.cpSync('media',path.join(out,'media'),{recursive:true});
const read=(f,def=null)=>fs.existsSync(f)?JSON.parse(fs.readFileSync(f,'utf8')):def;
const entries=(folder)=>fs.existsSync('content/'+folder)?fs.readdirSync('content/'+folder).filter(f=>f.endsWith('.json')).sort().map(f=>({path:'content/'+folder+'/'+f,data:read('content/'+folder+'/'+f)})):[];
const cache=read('content/translations.tr.json',{entries:{}})?.entries||{};
function tr(file,field,en,legacy=''){
 if(!en)return legacy||'';
 const c=cache[file+':'+field];
 if(c?.source===en && c.translation)return c.translation;
 if(c?.source && c.source!==en)return en;
 return legacy||en;
}
const works=entries('works').map(({path:file,data:w})=>{const en=w.description_en||w.description?.en||'';return {...w,description:{en,tr:tr(file,'description_en',en,w.description_tr||w.description?.tr||'')}}});
const gallery=entries('gallery').map(v=>v.data);
const bio=read('content/bio.json',{});
for(const p of ['p1','p2']){const en=bio[p+'_en']||'';bio[p+'_tr']=tr('content/bio.json',p+'_en',en,bio[p+'_tr']||'');}
const news=entries('news').map(({path:file,data:n})=>{for(const p of ['title','description']){const en=n[p+'_en']||'';n[p+'_tr']=tr(file,p+'_en',en,n[p+'_tr']||'');}return n;});
const legacyNews=read('content/news.json',{});
for(const p of ['title','description']){const en=legacyNews[p+'_en']||'';legacyNews[p+'_tr']=tr('content/news.json',p+'_en',en,legacyNews[p+'_tr']||'');}
fs.writeFileSync(path.join(out,'archive-content.js'),'window.ARCHIVE_CONTENT='+JSON.stringify({works,gallery,bio,news,legacyNews}).replace(/</g,'\\u003c')+';');
console.log('Built '+works.length+' works, '+gallery.length+' photos, '+news.length+' articles. EN source / TR cache.');
