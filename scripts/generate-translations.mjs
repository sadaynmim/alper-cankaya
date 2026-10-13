import fs from 'node:fs';
const cacheFile='content/translations.tr.json';
const read=(p,def=null)=>fs.existsSync(p)?JSON.parse(fs.readFileSync(p,'utf8')):def;
const files=['content/bio.json','content/news.json'];
for(const dir of ['works','news'])if(fs.existsSync('content/'+dir))files.push(...fs.readdirSync('content/'+dir).filter(f=>f.endsWith('.json')).sort().map(f=>'content/'+dir+'/'+f));
const fields=f=>f.endsWith('/bio.json')?['p1_en','p2_en']:f.includes('/works/')?['description_en']:['title_en','description_en'];
const previous=read(cacheFile,{entries:{}})?.entries||{};
const next={},missing=[];
for(const file of files){const d=read(file);if(!d)continue;
  for(const field of fields(file)){
    const source=String(d[field]||'').trim();if(!source)continue;
    const id=file+':'+field;
    if(previous[id]?.source===source && previous[id]?.translation)next[id]=previous[id];
    else missing.push({id,source});
  }
}
const key=process.env.GOOGLE_CLOUD_TRANSLATE_API_KEY;
if(missing.length && !key){console.warn('Missing Google Cloud API key. Turkish translations are pending; existing translations are preserved.');process.exit(0);}
function decode(s){const names={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '};
  return s.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi,(_,c)=>{
    if(/^#x/i.test(c))return String.fromCodePoint(parseInt(c.slice(2),16));
    if(c.startsWith('#'))return String.fromCodePoint(parseInt(c.slice(1),10));
    return names[c.toLowerCase()]||'&'+c+';';
  });
}
for(const item of missing){
 const response=await fetch('https://translation.googleapis.com/language/translate/v2?key='+encodeURIComponent(key),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({q:item.source,source:'en',target:'tr',format:'text'})});
 if(!response.ok)throw Error('Translation API HTTP '+response.status+': '+(await response.text()).slice(0,250));
 const data=await response.json();const t=data?.data?.translations?.[0]?.translatedText;
 if(!t)throw Error('Empty translation for '+item.id);
 next[item.id]={source:item.source,translation:decode(t)};
}
fs.mkdirSync('content',{recursive:true});
fs.writeFileSync(cacheFile,JSON.stringify({version:1,entries:next},null,2)+'\n');
console.log('Translated '+missing.length+' texts; '+Object.keys(next).length+' cached.');
