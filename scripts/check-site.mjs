import fs from 'node:fs';
import vm from 'node:vm';
const must=(cond,msg)=>{if(!cond)throw new Error(msg);};
const html=fs.readFileSync('dist/index.html','utf8');
const raw=fs.readFileSync('dist/archive-content.js','utf8');
must(raw.startsWith('window.ARCHIVE_CONTENT='),'Missing generated site data');
const archive=JSON.parse(raw.slice('window.ARCHIVE_CONTENT='.length).replace(/;\s*$/,''));
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
must(scripts.length>0,'Missing site JavaScript');
for(const tag of scripts) new vm.Script(tag[1],{filename:'inline-site.js'});
must(Array.isArray(archive.works)&&archive.works.length>=8,'Filmography missing');
must(Array.isArray(archive.news)&&archive.news.length>=1,'News missing');
must(typeof archive.bio.p1_en==='string'&&archive.bio.p1_en.length>20,'Biography missing');
must(typeof archive.bio.p1_tr==='string'&&archive.bio.p1_tr.length>20,'Turkish biography missing');
const award=archive.awards?.find(a=>a.year==='2023'&&a.film==='Cam Perde');
must(award?.title_en==='Best Actor'&&award.title_tr==='En İyi Erkek Oyuncu','Verified bilingual festival award missing');
must(html.includes('id="awards"')&&html.includes('href="#awards"'),'Awards section or navigation missing');
for(const locale of ['en','tr'])must(archive.bio['p4_'+locale]?.length>50&&archive.bio['p5_'+locale]?.length>50,'Expanded bilingual biography missing');
must(archive.site.hero_image,'Homepage portrait missing');
must(html.includes('id="heroPhoto"'),'Dynamic hero not present');
must(html.includes('data-lang="tr"')&&html.includes('data-lang="en"'),'Language buttons missing');
must(!html.includes('data-lang="fr"')&&!html.includes('data-lang="ar"'),'Removed language options persist');
const title=archive.news.find(n=>n.title_en?.includes('APA Talks'));
must(title&&title.title_tr?.includes('APA Talks'),'APA Talks localized news missing');
for(const work of archive.works) must(work.description?.en&&work.description?.tr,'Missing localized character description');
console.log('Validated HTML script, EN/TR localization, homepage configuration, filmography and APA Talks news.');

const videoIds=new Set();
for(const video of archive.videos||[]){
 must(/^[\w-]{11}$/.test(video.id),'Invalid YouTube video ID');
 must(!videoIds.has(video.id),'Duplicate gallery interview');videoIds.add(video.id);
 must(video.url==='https://www.youtube.com/watch?v='+video.id&&video.channel,'Missing original interview source');
}
must(videoIds.has('U4NpYia1eus')&&videoIds.has('WVDOQHT7RJA')&&videoIds.size>=5,'Requested interviews missing from gallery');
must(award.image&&fs.existsSync('dist/'+award.image)&&award.image_credit&&award.image_source,'Award ceremony photograph or credit missing');
const covered=new Set([1,2]);
for(const chapter of archive.bio.chapters||[]){
 for(let i=chapter.from;i<=chapter.to;i++){
  must(!covered.has(i),'Duplicate biography paragraph');covered.add(i);
  for(const locale of ['en','tr'])must(archive.bio['p'+i+'_'+locale]?.length>50,'Missing biography chapter translation');
 }
}
must(covered.size===8,'Biography chapter missing');
console.log('Validated award photograph, eight bilingual biography paragraphs and five unique source-linked interviews.');
