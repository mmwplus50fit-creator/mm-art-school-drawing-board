const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const { webcrypto } = require('node:crypto');
const source = fs.readFileSync(require('node:path').join(__dirname, '../app.js'), 'utf8');
const importer = source.slice(source.indexOf('async function addImages('), source.indexOf('function shuffle('));
function setup() {
  const nodes = Object.fromEntries(['board-view','library','choose-images','file-input'].map(id=>[id,{ hidden:id==='library', disabled:false, value:'' }]));
  const state = { notifications:[], imports:[], opened:[], modal:false, pending:null };
  const context = vm.createContext({ File, Blob, Date, Array, Set, crypto:webcrypto, structuredClone, navigator:{},
    document:{querySelector:()=>state.modal,addEventListener(){}},
    $:id=>nodes[id],
    notify:message=>state.notifications.push(message),
    createImageBitmap:async()=>{if(state.pending)await state.pending;return {close(){}};},
    openBoard:id=>state.opened.push(id), renderLibrary:()=>state.opened.push('library'),
    persist:async next=>{context.saved=next;vm.runInContext('library = saved',context);}
  });
  vm.runInContext(`let selected='runners',busy=false; const acceptedTypes=new Set(['image/png','image/jpeg','image/webp','image/gif','image/avif']); let library={boards:[{id:'runners',name:'Runners',images:[]},{id:'faces',name:'Faces',images:[]}]}; const uid=()=>crypto.randomUUID(); const currentBoard=()=>library.boards.find(b=>b.id===selected); ${importer}`,context);
  return { context, state, nodes, run:code=>vm.runInContext(code,context) };
}
const image = () => new File(['image bytes'], 'image.png', {type:'image/png'});
const item = file => ({kind:'file',type:file.type,getAsFile:()=>file});
test('clipboard image items all import once and receive unique safe names',()=>{
  const env=setup(); const first=image(),second=image();env.context.data={items:[item(first),item(second)],files:[first,second]};
  const files=env.run('clipboardImages(data)');assert.equal(files.length,2);assert.notEqual(files[0].name,files[1].name);assert.match(files[0].name,/^pasted-.*\.png$/);assert.equal(files[0].type,'image/png');
});
test('clipboard file fallback works without item entries',()=>{const env=setup();env.context.data={files:[image()]};assert.equal(env.run('clipboardImages(data).length'),1);});
test('plain text reports feedback without taking over native paste',()=>{const env=setup();let prevented=false;env.context.event={target:{closest:()=>false},clipboardData:{items:[]},preventDefault(){prevented=true;}};env.run('handleImagePaste(event)');assert.match(env.state.notifications[0],/does not contain an image/);assert.equal(prevented,false);});
test('text inputs, dialogs and other views keep normal paste behavior',()=>{for(const scope of ['input','modal','library']){const env=setup();env.context.event={target:{closest:()=>scope==='input'},clipboardData:{items:[item(image())]},preventDefault(){throw Error('Paste intercepted');}};if(scope==='modal')env.state.modal=true;if(scope==='library')env.nodes['board-view'].hidden=true;env.run('handleImagePaste(event)');assert.equal(env.state.notifications.length,0);}});
test('shared importer saves all images to the selected board and confirms board name',async()=>{const env=setup();env.context.files=[image(),image()];await env.run('addImages(files)');assert.equal(env.context.saved.boards[0].images.length,2);assert.equal(env.context.saved.boards[1].images.length,0);assert.match(env.state.notifications[0],/2 images added to Runners/);});
test('changing board during decoding does not misroute images or pull the user back',async()=>{const env=setup();let release;env.state.pending=new Promise(resolve=>release=resolve);env.context.files=[image()];const saving=env.run('addImages(files)');env.run("selected='faces'");release();await saving;assert.equal(env.context.saved.boards[0].images.length,1);assert.equal(env.context.saved.boards[1].images.length,0);assert.equal(env.state.opened.length,0);});
test('unsupported and oversized inputs do not alter boards',async()=>{const env=setup();env.context.files=[new File(['text'],'note.txt',{type:'text/plain'}),{name:'huge.png',type:'image/png',size:21*1024*1024}];await env.run('addImages(files)');assert.equal(env.context.saved,undefined);assert.match(env.state.notifications[0],/2 file\(s\) could not be imported/);});
