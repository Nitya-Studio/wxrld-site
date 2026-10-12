const $=(selector,context=document)=>context.querySelector(selector);
const $$=(selector,context=document)=>[...context.querySelectorAll(selector)];
const portfolioFallback=[
  {title:'California',image:'assets/california.webp',thumbnail:'assets/thumbs/california.webp',category:'Banners'},
  {title:'Clients',image:'assets/clients.webp',thumbnail:'assets/thumbs/clients.webp',category:'UI & Systems'},
  {title:'Flow Order',image:'assets/flow-order.webp',thumbnail:'assets/thumbs/flow-order.webp',category:'UI & Systems'},
  {title:'Footer',image:'assets/footer.webp',thumbnail:'assets/thumbs/footer.webp',category:'Banners'},
  {title:'GoTurbo',image:'assets/goturbo.webp',thumbnail:'assets/thumbs/goturbo.webp',category:'Branding'},
  {title:'Melbourne Sessions',image:'assets/melbourne-sessions.webp',thumbnail:'assets/thumbs/melbourne-sessions.webp',category:'Social Media'},
  {title:'Melbourne Roleplay',image:'assets/melbourne.webp',thumbnail:'assets/thumbs/melbourne.webp',category:'Banners'},
  {title:'Metro',image:'assets/metro.webp',thumbnail:'assets/thumbs/metro.webp',category:'Banners'},
  {title:'NSW Police',image:'assets/nsw-police.webp',thumbnail:'assets/thumbs/nsw-police.webp',category:'Social Media'},
  {title:'RCE Autumn',image:'assets/rce-autumn.webp',thumbnail:'assets/thumbs/rce-autumn.webp',category:'Social Media'},
  {title:'RCE Welcome',image:'assets/rce-welcome.webp',thumbnail:'assets/thumbs/rce-welcome.webp',category:'Social Media'},
  {title:'Rewards ERLC',image:'assets/rewards.webp',thumbnail:'assets/thumbs/rewards.webp',category:'Social Media'},
  {title:'Space Customs',image:'assets/space-main.webp',thumbnail:'assets/thumbs/space-main.webp',category:'Branding'},
  {title:'Space Reviews',image:'assets/space-reviews.webp',thumbnail:'assets/thumbs/space-reviews.webp',category:'Social Media'},
  {title:'Terms',image:'assets/terms.webp',thumbnail:'assets/thumbs/terms.webp',category:'UI & Systems'},
  {title:'Wxrldz Hero',image:'assets/wxrldz-hero.webp',thumbnail:'assets/thumbs/wxrldz-hero.webp',category:'Banners'}
];
const localPortfolioByFilename=new Map(portfolioFallback.map(item=>[item.image.split('/').pop(),item]));
const portfolioDialog=$('#portfolio-dialog');
const viewer=$('#viewer');
let allPortfolio=[];

function openPortfolio(){portfolioDialog.showModal();document.body.classList.add('dialog-open')}
function closePortfolio(){portfolioDialog.close();document.body.classList.remove('dialog-open')}
function openViewer(item){
  viewer.querySelector('img').src=item.image;
  viewer.querySelector('img').alt=`${item.title} graphic design project`;
  viewer.querySelector('b').textContent=item.title;
  viewer.showModal();
}
function renderPortfolio(items){
  const grid=$('#portfolio-grid');grid.innerHTML='';
  items.forEach(item=>{
    const button=document.createElement('button'),image=document.createElement('img');
    button.className='portfolio-item';image.src=item.thumbnail||item.image;image.alt=`${item.title} graphic design project`;image.loading='lazy';image.decoding='async';image.fetchPriority='low';
    button.append(image);
    button.addEventListener('click',()=>openViewer(item));
    grid.appendChild(button);
  });
}
function renderHomePortfolio(items){
  const grid=$('#home-portfolio-grid');grid.innerHTML='';
  items.forEach((item,index)=>{
    const button=document.createElement('button'),image=document.createElement('img');
    button.className='home-work';image.src=item.thumbnail||item.image;image.alt=`${item.title} graphic design project`;image.loading=index>2?'lazy':'eager';image.decoding='async';image.fetchPriority=index<3?'high':'auto';
    button.append(image);button.addEventListener('click',()=>openViewer(item));grid.appendChild(button);
  });
}
function setPortfolioCategory(category,activeButton){
  $$('.portfolio-filter').forEach(button=>button.classList.toggle('active',button===activeButton));
  renderHomePortfolio(category==='All'?allPortfolio:allPortfolio.filter(item=>item.category===category));
}
function renderPortfolioFilters(){
  const holder=$('#portfolio-filters'),categories=['All',...new Set(allPortfolio.map(item=>item.category||'Portfolio'))];holder.innerHTML='';
  categories.forEach((category,index)=>{
    const button=document.createElement('button');button.className=`portfolio-filter${index?'':' active'}`;button.type='button';button.textContent=category;
    button.addEventListener('click',()=>setPortfolioCategory(category,button));holder.appendChild(button);
  });
}
function titleFromFilename(name){return name.replace(/\.[^.]+$/,'').replace(/[-_]+/g,' ').replace(/\b\w/g,letter=>letter.toUpperCase())}
function folderCategory(path){
  const parts=path.split('/').filter(Boolean);
  if(parts.length>1)return titleFromFilename(parts[parts.length-2]);
  const filename=parts[0].toLowerCase();
  if(/flow-order|terms|clients/.test(filename))return'UI & Systems';
  if(/sessions|reviews|autumn|rewards/.test(filename))return'Social Media';
  if(/goturbo|space-main/.test(filename))return'Branding';
  return'Banners';
}
function rawGithubUrl(config,path){return `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch||'main'}/${path.split('/').map(encodeURIComponent).join('/')}`}
async function fetchGithubPortfolio(){
  const config=window.WXRLDZ_PORTFOLIO||{};
  if(!config.owner||!config.repo)throw new Error('Missing GitHub portfolio configuration');
  const response=await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}/git/trees/${encodeURIComponent(config.branch||'main')}?recursive=1`,{headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'},cache:'no-store'});
  if(!response.ok)throw new Error(`GitHub returned ${response.status}`);
  const data=await response.json();
  return(data.tree||[]).filter(file=>file.type==='blob'&&/\.(png|jpe?g|webp|gif|avif)$/i.test(file.path)).map(file=>{
    const filename=file.path.split('/').pop(),local=localPortfolioByFilename.get(filename);
    return{
      title:local?.title||titleFromFilename(filename),
      image:local?.image||rawGithubUrl(config,file.path),
      thumbnail:local?.thumbnail||rawGithubUrl(config,file.path),
      category:local?.category||folderCategory(file.path)
    };
  });
}
function showPortfolio(items){
  allPortfolio=items;
  renderHomePortfolio(items);
  renderPortfolio(items);
}
async function loadPortfolio(){
  showPortfolio([...portfolioFallback]);
  try{
    const response=await fetch('portfolio/manifest.json');if(!response.ok)throw new Error('Portfolio manifest unavailable');
    const data=await response.json(),items=(data.items||data).filter(item=>item.image).map(item=>({title:item.title||'Portfolio project',image:item.image,thumbnail:item.thumbnail||item.image,category:item.category||'Portfolio'}));
    if(items.length>=allPortfolio.length)showPortfolio(items);
  }catch{}
  fetchGithubPortfolio().then(items=>{if(items.length)showPortfolio(items)}).catch(()=>{});
}
$('#portfolio-archive-open').addEventListener('click',openPortfolio);
$('#portfolio-close').addEventListener('click',closePortfolio);
$('#viewer-close').addEventListener('click',()=>viewer.close());
portfolioDialog.addEventListener('close',()=>document.body.classList.remove('dialog-open'));
loadPortfolio();

const mobileMenu=$('#mobile-menu'),primaryNav=$('#primary-nav');
mobileMenu.addEventListener('click',()=>{const open=primaryNav.classList.toggle('open');mobileMenu.setAttribute('aria-expanded',String(open))});
$$('#primary-nav a, #primary-nav button').forEach(item=>item.addEventListener('click',()=>{primaryNav.classList.remove('open');mobileMenu.setAttribute('aria-expanded','false')}));

const tracks=[
  {title:'Solar Eclipse',artist:'Drake & Don Toliver',src:'audio/solar-eclipse.mp3',cover:'audio/covers/solar-eclipse.jpg'},
  {title:'Not You Too',artist:'Drake ft. Chris Brown',src:'audio/not-you-too.mp3',cover:'audio/covers/not-you-too.jpg'},
  {title:'Fell In Luv',artist:'Playboi Carti',src:'audio/fell-in-luv.mp3',cover:'audio/covers/fell-in-luv.jpg'},
  {title:'L’AMOUR DE MA VIE',artist:'Billie Eilish',src:'audio/lamour-de-ma-vie.mp3',cover:'audio/covers/lamour-de-ma-vie.jpg'},
  {title:'Rosary',artist:'Don Toliver ft. Travis Scott',src:'audio/rosary.mp3',cover:'audio/covers/rosary.jpg'},
  {title:'Tuition',artist:'Don Toliver',src:'audio/tuition.mp3',cover:'audio/covers/tuition.jpg'},
  {title:'White Ferrari',artist:'Frank Ocean',src:'audio/white-ferrari.mp3',cover:'audio/covers/white-ferrari.jpg'},
  {title:'Lost',artist:'Frank Ocean',src:'audio/lost.mp3',cover:'audio/covers/lost.jpg'},
  {title:'A Couple Minutes',artist:'Olivia Dean',src:'audio/a-couple-minutes.mp3',cover:'audio/covers/a-couple-minutes.jpg'},
  {title:'National Treasures',artist:'Drake',src:'audio/national-treasures.mp3',cover:'audio/covers/national-treasures.jpg'}
];
let trackIndex=0;
const player=$('#music-player'),audio=$('#audio-player'),seek=$('#music-seek');
audio.volume=.78;
function formatTime(seconds){return Number.isFinite(seconds)?`${Math.floor(seconds/60)}:${String(Math.floor(seconds%60)).padStart(2,'0')}`:'0:00'}
function selectTrack(index,play=false,load=true){
  trackIndex=(index+tracks.length)%tracks.length;const track=tracks[trackIndex];
  if(load)audio.src=track.src;else audio.removeAttribute('src');
  $('#music-title').textContent=track.title;$('#music-artist').textContent=track.artist;$('#music-cover').src=track.cover;$('#music-cover').alt=`${track.title} cover art`;
  $$('.music-track').forEach((button,i)=>button.classList.toggle('active',i===trackIndex));
  if(play)audio.play().catch(()=>{$('#music-state').textContent='CLICK PLAY'});
}
tracks.forEach((track,index)=>{
  const button=document.createElement('button');button.className='music-track';button.innerHTML=`<span>${String(index+1).padStart(2,'0')}</span><b></b><small></small>`;
  button.querySelector('b').textContent=track.title;button.querySelector('small').textContent=track.artist;button.addEventListener('click',()=>selectTrack(index,true));$('#music-tracklist').appendChild(button);
});
function updatePlayState(){const playing=!audio.paused;$('#music-play').textContent=playing?'PAUSE':'PLAY';$('#music-state').textContent=playing?'NOW PLAYING':'PAUSED'}
$('#music-summary').addEventListener('click',()=>{const open=player.classList.toggle('open');$('#music-summary').setAttribute('aria-expanded',String(open))});
$('#music-play').addEventListener('click',()=>{if(!audio.paused){audio.pause();return}if(!audio.getAttribute('src'))selectTrack(trackIndex,true);else audio.play().catch(()=>{})});
$('#music-next').addEventListener('click',()=>selectTrack(trackIndex+1,true));
audio.addEventListener('play',updatePlayState);audio.addEventListener('pause',updatePlayState);audio.addEventListener('ended',()=>selectTrack(trackIndex+1,true));
audio.addEventListener('loadedmetadata',()=>{$('#music-duration').textContent=formatTime(audio.duration)});
audio.addEventListener('timeupdate',()=>{if(!audio.duration)return;seek.value=String(audio.currentTime/audio.duration*100);$('#music-current').textContent=formatTime(audio.currentTime)});
seek.addEventListener('input',()=>{if(audio.duration)audio.currentTime=Number(seek.value)/100*audio.duration});
selectTrack(0,false,false);
const entryScreen=$('#entry-screen'),entryEnter=$('#entry-enter');
function enterSite(){
  if(entryScreen.classList.contains('leaving'))return;
  entryEnter.blur();entryEnter.disabled=true;entryScreen.classList.add('leaving');entryScreen.setAttribute('aria-hidden','true');
  document.body.classList.remove('entry-locked');
  if(!audio.getAttribute('src'))selectTrack(trackIndex,true);else audio.play().catch(()=>{});
  window.setTimeout(()=>entryScreen.remove(),750);
}
entryEnter.addEventListener('click',enterSite);
document.addEventListener('keydown',event=>{if(event.key!=='Escape')return;if(viewer.open)viewer.close();else if(portfolioDialog.open)closePortfolio()});
