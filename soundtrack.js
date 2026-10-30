'use strict';
function youtubeSoundtrack(value){
 const input=String(value||'').trim();
 if(!input||input.length>2048)throw new Error('Paste a YouTube video, livestream or playlist link.');
 let url;try{url=new URL(/^[\w+.-]+:/.test(input)?input:'https://'+input);}catch{throw new Error('That link could not be read. Paste a YouTube share link.');}
 const host=url.hostname.toLowerCase();
 if(url.protocol!=='https:'||url.username||url.password||url.port||!['youtube.com','www.youtube.com','m.youtube.com','music.youtube.com','youtu.be','www.youtu.be','www.youtube-nocookie.com','youtube-nocookie.com'].includes(host))throw new Error('Please use an HTTPS YouTube video or playlist link.');
 const path=url.pathname.split('/').filter(Boolean);let video='',list=url.searchParams.get('list')||'';
 if(host.endsWith('youtu.be'))video=path[0]||'';
 else if(path[0]==='watch')video=url.searchParams.get('v')||'';
 else if(['live','shorts','embed'].includes(path[0])&&path[1]!=='videoseries')video=path[1]||'';
 if(video&&!/^[\w-]{11}$/.test(video))throw new Error('That video link is incomplete. Use the video’s Share link.');
 if(list&&!/^[\w-]{10,150}$/.test(list))throw new Error('That playlist link is incomplete. Use the playlist’s Share link.');
 if(!video&&!list)throw new Error('Use a specific video, livestream or playlist link, rather than a channel homepage.');
 const embed=new URL('https://www.youtube-nocookie.com/embed/'+(video||'videoseries'));
 embed.searchParams.set('playsinline','1');embed.searchParams.set('autoplay','0');
 if(list)embed.searchParams.set('list',list);
 const watch=new URL(video?'https://www.youtube.com/watch':'https://www.youtube.com/playlist');
 if(video)watch.searchParams.set('v',video);if(list)watch.searchParams.set('list',list);
 const time=url.searchParams.get('t')||url.searchParams.get('start');
 if(time&&/^\d+$/.test(time)&&Number(time)<=86400)embed.searchParams.set('start',String(Number(time)));
 return {embed:embed.href,watch:watch.href};
}
function initializeSoundtrack(){
 const form=document.getElementById('soundtrack-form'),input=document.getElementById('soundtrack-url'),dock=document.getElementById('soundtrack-dock'),holder=document.getElementById('soundtrack-frame'),message=document.getElementById('soundtrack-message'),open=document.getElementById('soundtrack-open');
 let loaded='';const key='mm-drawing-board-soundtrack';
 try{input.value=localStorage.getItem(key)||'';}catch{/* Playback works even when preferences cannot be stored. */}
 form.addEventListener('submit',event=>{
  event.preventDefault();let source;try{source=youtubeSoundtrack(input.value);}catch(err){message.textContent=err.message;input.focus();return;}
  if(loaded===source.embed){message.textContent='Your player is already loaded. Press Play in YouTube to listen.';return;}
  const frame=document.createElement('iframe');frame.title='Drawing soundtrack — YouTube player';frame.width='320';frame.height='200';frame.src=source.embed;frame.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';
  holder.replaceChildren(frame);loaded=source.embed;dock.hidden=false;document.body.classList.add('has-soundtrack');open.href=source.watch;
  message.textContent='Press Play in the YouTube player. Music continues as your drawing references change. If embedding is unavailable, choose Open YouTube.';
  try{localStorage.setItem(key,input.value.trim());}catch{message.textContent+=' This browser could not remember the link.';}
 });
 document.getElementById('soundtrack-stop').addEventListener('click',()=>{holder.replaceChildren();loaded='';dock.hidden=true;document.body.classList.remove('has-soundtrack');message.textContent='Soundtrack stopped. Your link is kept for next time.';});
 document.getElementById('soundtrack-clear').addEventListener('click',()=>{document.getElementById('soundtrack-stop').click();input.value='';try{localStorage.removeItem(key);}catch{}message.textContent='Soundtrack and saved link cleared.';});
}
if(typeof module!=='undefined')module.exports={youtubeSoundtrack};
if(typeof document!=='undefined')initializeSoundtrack();
