'use strict';
function planPractice({mode, rounds, seconds, minutes, imageCount}) {
 if(!imageCount)throw new Error('Add at least one reference to start drawing.');
 const totalMs=Math.round(Number(minutes)*60000),eachMs=Math.round(Number(seconds)*1000);
 if(mode!=='count'&&(!Number.isFinite(totalMs)||totalMs<1000||totalMs>28800000))throw new Error('Choose a total duration between 1 second and 480 minutes.');
 if(mode!=='fit'&&(!Number.isFinite(eachMs)||eachMs<1000||eachMs>1200000))throw new Error('Choose 1 to 1200 seconds per reference.');
 const count=mode==='time'?Math.ceil(totalMs/eachMs):Number(rounds);
 if(!Number.isInteger(count)||count<1||count>10000)throw new Error('Choose between 1 and 10,000 rounds.');
 if(mode==='fit'&&totalMs<count*1000)throw new Error('Allow at least 1 second per round, or reduce the reference count.');
 const durations=Array.from({length:count},(_,i)=>mode==='fit'?(i===count-1?totalMs-Math.floor(totalMs/count)*(count-1):Math.floor(totalMs/count)):mode==='time'?Math.min(eachMs,totalMs-i*eachMs):eachMs);
 return {durations,count,totalMs:durations.reduce((a,b)=>a+b,0),uniqueCount:Math.min(imageCount,count),repeats:Math.max(0,count-imageCount)};
}
function practiceSequence(images,count,randomize,random=Math.random) {
 const result=[];
 while(result.length<count){
  const pass=[...images];
  if(!pass.length)throw new Error('No references available.');
  if(randomize){for(let i=pass.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pass[i],pass[j]]=[pass[j],pass[i]];}
   if(pass.length>1&&result.length&&pass[0].id===result[result.length-1].id){const j=1+Math.floor(random()*(pass.length-1));[pass[0],pass[j]]=[pass[j],pass[0]];}}
  result.push(...pass.slice(0,count-result.length));
 }
 return result;
}
if(typeof module!=='undefined')module.exports={planPractice,practiceSequence};
