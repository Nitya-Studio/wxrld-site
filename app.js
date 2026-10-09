const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
const fallbackPortfolio=[
 {title:'MELBOURNE ROLEPLAY',type:'ROLEPLAY IDENTITY',image:'assets/melbourne.webp',copy:'A cinematic blue identity that gives a roleplay community a sense of place before a player ever joins.',url:'https://discord.gg/U3AB4BdN5'},
 {title:'GOTURBO',type:'AUTOMOTIVE SYSTEM',image:'assets/goturbo.webp',copy:'A fast, minimal visual language made to feel like it is already moving.',url:'https://discord.gg/5dkzguwyF'},
 {title:'SPACE CUSTOMS',type:'CUSTOMS IDENTITY',image:'assets/space-main.webp',copy:'A deep-blue identity system engineered for a polished custom automotive community.',url:'https://discord.gg/spacecustoms'},
 {title:'ROBLOX COMMUNITY EVENTS',type:'EVENTS SYSTEM',image:'assets/rce-welcome.webp',copy:'A high-energy launch system designed to make every community moment feel like an event.',url:'https://discord.gg/rce'},
 {title:'REWARDSERLC',type:'COMMUNITY IDENTITY',image:'assets/rewards.webp',copy:'A bright, approachable identity that makes rewards and recognition feel official.',url:'https://discord.gg/4n86jzt38'}
];
const fallbackSelectedPortfolio=[
 {title:'WXRLDZ COMMISSIONS',type:'SERVER BANNER',image:'assets/wxrldz-server-banner.webp',copy:'A focused monochrome banner for the Wxrldz commissions portfolio.',url:'https://discord.gg/wxrldz'},
 ...fallbackPortfolio
];
const tracks=[
 {title:'Solar Eclipse',artist:'Drake & Don Toliver',src:'audio/solar-eclipse.mp3',cover:'audio/covers/solar-eclipse.jpg'},
 {title:'Not You Too',artist:'Drake ft. Chris Brown',src:'audio/not-you-too.mp3',cover:'audio/covers/not-you-too.jpg'},
 {title:'Fell In Luv',artist:'Playboi Carti',src:'audio/fell-in-luv.mp3',cover:'audio/covers/fell-in-luv.jpg'},
 {title:"L’AMOUR DE MA VIE",artist:'Billie Eilish',src:'audio/lamour-de-ma-vie.mp3',cover:'audio/covers/lamour-de-ma-vie.jpg'},
 {title:'Rosary',artist:'Don Toliver ft. Travis Scott',src:'audio/rosary.mp3',cover:'audio/covers/rosary.jpg'},
 {title:'Tuition',artist:'Don Toliver',src:'audio/tuition.mp3',cover:'audio/covers/tuition.jpg'},
 {title:'White Ferrari',artist:'Frank Ocean',src:'audio/white-ferrari.mp3',cover:'audio/covers/white-ferrari.jpg'},
 {title:'Lost',artist:'Frank Ocean',src:'audio/lost.mp3',cover:'audio/covers/lost.jpg'},
 {title:'A Couple Minutes',artist:'Olivia Dean',src:'audio/a-couple-minutes.mp3',cover:'audio/covers/a-couple-minutes.jpg'},
 {title:'National Treasures',artist:'Drake',src:'audio/national-treasures.mp3',cover:'audio/covers/national-treasures.jpg'}
];
let selectedPortfolio=fallbackSelectedPortfolio.map((item,index)=>normalizeItem(item,index,'Featured'));
let allPortfolio=[],archiveVisible=[],workIndex=0,workSwapToken=0;
const heroMessages=['High quality.','Fast turnaround.','Great service.','Standout graphics.'];
const heroSwitchingText=$('#hero-switching-text');
let heroMessageIndex=0;
if(heroSwitchingText&&!matchMedia('(prefers-reduced-motion: reduce)').matches)setInterval(()=>{heroSwitchingText.classList.add('changing');setTimeout(()=>{heroMessageIndex=(heroMessageIndex+1)%heroMessages.length;heroSwitchingText.textContent=heroMessages[heroMessageIndex];heroSwitchingText.classList.remove('changing')},260)},3200);
function titleFromFilename(name){return name.replace(/\.[^.]+$/,'').replace(/[-_]+/g,' ').replace(/\b\w/g,l=>l.toUpperCase())}
function normalizeItem(item,index,category='Featured'){return{title:item.title||titleFromFilename(item.name||`Project ${index+1}`),type:item.type||`${category.toUpperCase()} / PORTFOLIO`,image:item.image||item.download_url||'',copy:item.copy||`A selected ${category.toLowerCase()} project from the live portfolio library.`,url:item.url||'#',category:item.category||category}}
function preloadPortfolio(items){items.forEach(item=>{if(!item.image)return;const image=new Image;image.decoding='async';image.src=item.image})}
function setWork(index){if(!selectedPortfolio.length)return;workIndex=(index+selectedPortfolio.length)%selectedPortfolio.length;const swapToken=++workSwapToken,item=selectedPortfolio[workIndex],image=$('#work-image'),preload=new Image;image.classList.add('is-switching');preload.decoding='async';preload.onload=()=>{if(swapToken!==workSwapToken)return;image.src=item.image;image.alt=`${item.title} project`;requestAnimationFrame(()=>image.classList.remove('is-switching'))};preload.onerror=()=>{if(swapToken===workSwapToken)image.classList.remove('is-switching')};preload.src=item.image;$('#work-title').textContent=item.title;$('#work-type').textContent=item.type;$('#work-copy').textContent=item.copy;$('#work-position').textContent=`${String(workIndex+1).padStart(2,'0')} / ${String(selectedPortfolio.length).padStart(2,'0')}`}
function rawGithubUrl(config,path){return `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch||'main'}/${path.split('/').map(encodeURIComponent).join('/')}`}
function folderLabel(path){const parts=path.split('/').filter(Boolean);const folder=parts.length>1?parts[parts.length-2]:'Banners';return titleFromFilename(folder)}
async function fetchAllGithubWork(){const config=window.WXRLDZ_PORTFOLIO||{};if(!config.owner||!config.repo)throw Error('missing repository');const branch=encodeURIComponent(config.branch||'main'),url=`https://api.github.com/repos/${config.owner}/${config.repo}/git/trees/${branch}?recursive=1`,res=await fetch(url,{headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'},cache:'no-store'});if(!res.ok)throw Error(res.status);const data=await res.json();return(data.tree||[]).filter(file=>file.type==='blob'&&/\.(png|jpe?g|webp|gif|avif)$/i.test(file.path)).map((file,index)=>normalizeItem({name:file.path.split('/').pop(),image:rawGithubUrl(config,file.path),category:folderLabel(file.path),type:`${folderLabel(file.path).toUpperCase()} / GITHUB`,copy:`Live portfolio artwork from ${file.path}.`,url:`https://github.com/${config.owner}/${config.repo}/blob/${config.branch||'main'}/${file.path.split('/').map(encodeURIComponent).join('/')}`},index,folderLabel(file.path)))}
function openArchiveItem(item){viewer.querySelector('img').src=item.image;viewer.querySelector('img').alt=`${item.title} project`;viewer.querySelector('b').textContent=item.title;viewer.showModal()}
function renderArchive(items=archiveVisible){const grid=$('#archive-grid'),empty=$('#archive-empty');grid.innerHTML='';empty.hidden=items.length>0;const groups=new Map;items.forEach(item=>{const category=item.category||'Banners';if(!groups.has(category))groups.set(category,[]);groups.get(category).push(item)});groups.forEach((group,category)=>{const section=document.createElement('section'),heading=document.createElement('h3'),gallery=document.createElement('div');section.className='archive-category';heading.textContent=category;gallery.className='archive-category-grid';group.forEach((item,index)=>{const button=document.createElement('button'),meta=document.createElement('span'),image=document.createElement('img'),title=document.createElement('b');button.className='archive-item is-loading';meta.textContent=String(index+1).padStart(2,'0');image.src=item.image;image.alt=`${item.title} project`;image.loading='lazy';image.decoding='async';image.addEventListener('load',()=>button.classList.remove('is-loading'),{once:true});image.addEventListener('error',()=>button.classList.remove('is-loading'),{once:true});title.textContent=item.title;button.append(meta,image,title);button.addEventListener('click',()=>openArchiveItem(item));gallery.appendChild(button)});section.append(heading,gallery);grid.appendChild(section)})}
function setArchiveCategory(category,button){$$('.archive-filter').forEach(item=>item.classList.toggle('active',item===button));archiveVisible=category==='All'?[...allPortfolio]:allPortfolio.filter(item=>(item.category||'Root')===category);renderArchive()}
function renderArchiveFilters(){const holder=$('#archive-filters'),categories=['All',...new Set(allPortfolio.map(item=>item.category||'Root'))];holder.innerHTML='';categories.forEach((category,index)=>{const button=document.createElement('button');button.className=`archive-filter${index?'':' active'}`;button.textContent=category.toUpperCase();button.addEventListener('click',()=>setArchiveCategory(category,button));holder.appendChild(button)});archiveVisible=[...allPortfolio];renderArchive()}
async function loadPortfolio(){const config=window.WXRLDZ_PORTFOLIO||{};try{const res=await fetch(config.localManifest||'portfolio/manifest.json',{cache:'no-store'});if(!res.ok)throw Error('local');const data=await res.json();selectedPortfolio=(data.items||data).map((item,index)=>normalizeItem(item,index,item.category||'Featured'))}catch{selectedPortfolio=fallbackSelectedPortfolio.map((item,index)=>normalizeItem(item,index,'Featured'))}setWork(0);preloadPortfolio(selectedPortfolio);try{allPortfolio=await fetchAllGithubWork();$('#portfolio-source').textContent=`${allPortfolio.length} WORKS / LIVE`;renderArchiveFilters()}catch{allPortfolio=[];$('#portfolio-source').textContent='ARCHIVE UNAVAILABLE';$('#archive-empty').textContent='THE GITHUB REPOSITORY MUST BE PUBLIC';renderArchive()}}
$('#work-prev').addEventListener('click',()=>setWork(workIndex-1));
$('#work-next').addEventListener('click',()=>setWork(workIndex+1));
const archive=$('#portfolio-archive');
$('#open-archive').addEventListener('click',()=>archive.showModal());
$('#close-archive').addEventListener('click',()=>archive.close());
loadPortfolio();
function setClient(index){const item=fallbackPortfolio[index],image=$('#network-image');image.style.opacity='.2';image.style.transform='scale(1.03)';setTimeout(()=>{image.src=item.image;image.alt=`${item.title} banner`;image.style.opacity='1';image.style.transform='none'},160);$('#network-title').textContent=item.title;$('#network-type').textContent=`${item.type} / CLIENT 0${index+1}`;$('#network-focus').href=item.url;$$('.client-row').forEach((row,i)=>row.classList.toggle('active',i===index))}
$$('.client-row').forEach(row=>['mouseenter','focus','click'].forEach(evt=>row.addEventListener(evt,()=>setClient(Number(row.dataset.client)))));setClient(0);
const viewer=$('#viewer');$('#work-expand').addEventListener('click',()=>{viewer.querySelector('img').src=$('#work-image').src;viewer.querySelector('b').textContent=$('#work-title').textContent;viewer.showModal()});$('#viewer-close').addEventListener('click',()=>viewer.close());
let trackIndex=0;const player=$('#music-player'),audio=$('#audio-player'),seek=$('#music-seek');audio.volume=.78;
let hasInteracted=false;
function formatTime(seconds){if(!Number.isFinite(seconds))return'0:00';return`${Math.floor(seconds/60)}:${String(Math.floor(seconds%60)).padStart(2,'0')}`}
tracks.forEach((track,index)=>{const b=document.createElement('button');b.className='music-track';const number=document.createElement('span'),title=document.createElement('b'),artist=document.createElement('small');number.textContent=String(index+1).padStart(2,'0');title.textContent=track.title;artist.textContent=track.artist;b.append(number,title,artist);b.addEventListener('click',()=>selectTrack(index,true));$('#music-tracklist').appendChild(b)});
function selectTrack(index,play=false){trackIndex=(index+tracks.length)%tracks.length;const track=tracks[trackIndex];audio.src=track.src;$('#music-title').textContent=track.title;$('#music-artist').textContent=track.artist;$('#music-cover').src=track.cover;$('#music-cover').alt=`${track.title} cover art`;$$('.music-track').forEach((button,i)=>button.classList.toggle('active',i===trackIndex));$('#music-state').textContent=play?'LOADING':'READY';if(play)audio.play().catch(()=>{$('#music-state').textContent='CLICK PLAY'})}
function updatePlayState(){const playing=!audio.paused;$('#music-play').textContent=playing?'PAUSE':'PLAY';$('#music-state').textContent=playing?'NOW PLAYING':'PAUSED'}
function startMusic(){if(!audio.src)selectTrack(trackIndex);if(audio.paused){$('#music-state').textContent='LOADING';audio.play().catch(()=>{$('#music-state').textContent='CLICK PLAY'})}}
$('#music-summary').addEventListener('click',()=>{const wasOpen=player.classList.contains('open');player.classList.toggle('open',!wasOpen);if(!wasOpen)startMusic()});
$('#music-play').addEventListener('click',()=>{audio.paused?startMusic():audio.pause()});
$('#music-next').addEventListener('click',()=>selectTrack(trackIndex+1,true));
audio.addEventListener('play',updatePlayState);audio.addEventListener('pause',updatePlayState);audio.addEventListener('ended',()=>selectTrack(trackIndex+1,true));
audio.addEventListener('loadedmetadata',()=>{$('#music-duration').textContent=formatTime(audio.duration)});
audio.addEventListener('timeupdate',()=>{if(!audio.duration)return;seek.value=String(audio.currentTime/audio.duration*100);$('#music-current').textContent=formatTime(audio.currentTime)});
seek.addEventListener('input',()=>{if(audio.duration)audio.currentTime=Number(seek.value)/100*audio.duration});
selectTrack(0);
document.addEventListener('click',()=>{if(hasInteracted)return;hasInteracted=true;selectTrack(Math.floor(Math.random()*tracks.length),true)},{once:true});
document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;if(viewer.open)viewer.close();else if(archive.open)archive.close()});
