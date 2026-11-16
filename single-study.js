let singleStudy;
let studyThumbnailUrls = [];

function studyImages(data) {
 return [...data.boards.flatMap(board => board.images), ...(data.studyImages || [])];
}

function retainStudyReferences(next) {
 if (!next.studies?.length) return;
 const available = new Set(studyImages(next).map(image => image.id));
 for (const study of next.studies) {
  if (available.has(study.imageId)) continue;
  const image = studyImages(library).find(item => item.id === study.imageId);
  if (!image) continue;
  (next.studyImages ??= []).push(image);
  available.add(image.id);
 }
}

function studyOption(select, value, text) {
 select.append(new Option(text, value));
}

function clearStudyGallery() {
 for (const url of studyThumbnailUrls) URL.revokeObjectURL(url);
 studyThumbnailUrls = [];
 $('study-gallery').replaceChildren();
}

function renderStudyGallery() {
 clearStudyGallery();
 const picker = $('study-reference');
 if (!picker.open || !singleStudy) return;
 const gallery = $('study-gallery');
 const images = new Map(studyImages(library).map(image => [image.id, image]));
 const groups = [
  {name:'Saved studies', entries:(library.studies || []).map(study => ({image:images.get(study.imageId), title:study.title}))},
  ...library.boards.map(board => ({name:board.name, entries:board.images.map(image => ({image, title:image.name}))}))
 ];
 for (const {name, entries} of groups) {
  const grid = document.createElement('div');
  grid.className = 'study-thumbnails';
  for (const {image, title} of entries) {
   if (!image) continue;
   const button = document.createElement('button');
   button.type = 'button';
   const thumbnail = document.createElement('img');
   thumbnail.alt = '';
   thumbnail.loading = 'lazy';
   const url = URL.createObjectURL(image.blob);
   studyThumbnailUrls.push(url);
   thumbnail.src = url;
   const caption = document.createElement('span');
   caption.textContent = title;
   button.append(thumbnail, caption);
   button.onclick = () => {
    if (singleStudy.working) return;
    singleStudy.image = image;
    picker.open = false;
    renderSingleStudy();
    picker.querySelector('summary').focus();
   };
   grid.append(button);
  }
  if (!grid.children.length) continue;
  const heading = document.createElement('h3');
  heading.textContent = name;
  gallery.append(heading, grid);
 }
 if (!gallery.children.length) gallery.textContent = 'No references yet. Upload or paste an image to start.';
}

function renderSingleStudy() {
 const {image, returnBoard} = singleStudy;
 renderStudyGallery();
 const savedStudy = library.studies?.find(study => study.imageId === image?.id);
 $('study-title').value = savedStudy?.title ?? image?.name.slice(0, 120) ?? '';
 $('study-notes').value = savedStudy?.notes ?? '';
 $('study-title').setCustomValidity('');
 $('study-details').hidden = !image;
 $('fullscreen').disabled = !image;
 if (sessionUrl) URL.revokeObjectURL(sessionUrl);
 sessionUrl = image ? URL.createObjectURL(image.blob) : null;
 const reference = $('reference');
 reference.closest('.reference-frame').hidden = !image;
 if (image) {
  reference.src = sessionUrl;
  reference.alt = $('study-title').value;
 } else {
  reference.removeAttribute('src');
 }
 const boardPicker = $('study-board');
 boardPicker.replaceChildren();
 const inTimedPractice = image && library.boards.some(board => board.images.some(item => item.id === image.id));
 for (const board of library.boards) studyOption(boardPicker, board.id, board.name);
 if (returnBoard) boardPicker.value = returnBoard;
 $('study-board-label').hidden = $('study-add').hidden = Boolean(inTimedPractice) || !library.boards.length;
 $('study-status').textContent = inTimedPractice ? 'This reference is already available for timed practice.' : '';
}

function openSingleStudy(returnBoard, imageId) {
 if (!library || busy || running) return;
 const last = library.lastStudyImageId;
 const image = studyImages(library).find(item => item.id === (imageId || last));
 singleStudy = {returnBoard, image};
 releaseUrls();
 document.body.classList.add('single-study');
 $('study-form').hidden = false;
 $('end-session').textContent = returnBoard ? '← Back to board' : '← Back to home';
 $('session-board').textContent = 'SINGLE STUDY';
 show('session');
 renderSingleStudy();
 document.querySelector('.session-top').focus();
}

async function matchingStudyImage(file) {
 const candidates = studyImages(library).filter(image => image.blob.size === file.size);
 if (!candidates.length) return;
 const digest = async blob => new Uint8Array(await crypto.subtle.digest('SHA-256', await blob.arrayBuffer()));
 const expected = await digest(file);
 for (const image of candidates) {
  const actual = await digest(image.blob);
  if (actual.every((byte, index) => byte === expected[index])) return image;
 }
}

async function loadStudyFile(file) {
 if (!file || !singleStudy || singleStudy.working) return;
 const study = singleStudy;
 setStudyWorking(true);
 try {
  if (!acceptedTypes.has(file.type) || file.size > 20 * 1024 * 1024) {
   throw new Error('Use a JPG, PNG, WebP, GIF or AVIF up to 20 MB.');
  }
  const bitmap = await createImageBitmap(file);
  bitmap.close();
  study.image = await matchingStudyImage(file) || {id:uid(), name:file.name, blob:file};
  renderSingleStudy();
 } catch (err) {
  $('study-status').textContent = err.message;
 } finally {
  setStudyWorking(false);
  $('study-file').value = '';
 }
}

function setStudyWorking(working) {
 singleStudy.working = working;
 $('study-form').querySelectorAll('button, input, textarea, select').forEach(control => { control.disabled = working; });
 $('end-session').disabled = working;
}

async function saveSingleStudy(boardId) {
 const image = singleStudy?.image;
 if (!image || singleStudy.working) return;
 const titleInput = $('study-title');
 const title = titleInput.value.trim();
 titleInput.setCustomValidity(title ? '' : 'Enter a study title.');
 if (!titleInput.reportValidity()) return;
 const notes = $('study-notes').value;
 setStudyWorking(true);
 const saved = await mutate(next => {
  const existing = studyImages(next).find(item => item.id === image.id);
  const board = next.boards.find(item => item.id === boardId);
  if (board && !next.boards.some(item => item.images.some(reference => reference.id === image.id))) {
   board.images.push({...image, name:title});
   next.studyImages = (next.studyImages || []).filter(item => item.id !== image.id);
  } else if (!existing) {
   (next.studyImages ??= []).push(image);
  }
  const studies = next.studies ??= [];
  const index = studies.findIndex(study => study.imageId === image.id);
  const study = {imageId:image.id, title, notes};
  if (index === -1) studies.push(study);
  else studies[index] = study;
  next.lastStudyImageId = image.id;
 });
 setStudyWorking(false);
 if (!saved) {
  $('study-status').textContent = 'Study could not be saved. Try again.';
  return;
 }
 renderSingleStudy();
 $('study-status').textContent = boardId ? 'Study saved and reference added to the board.' : 'Study saved.';
 navigator.storage?.persist?.().catch(() => {});
}

function closeSingleStudy() {
 const {returnBoard} = singleStudy;
 singleStudy = null;
 $('study-reference').open = false;
 clearStudyGallery();
 document.body.classList.remove('single-study');
 $('study-form').hidden = true;
 $('end-session').textContent = '← End session';
 $('fullscreen').disabled = false;
 $('reference').closest('.reference-frame').hidden = false;
 $('reference').alt = 'Current drawing reference';
 if (sessionUrl) URL.revokeObjectURL(sessionUrl);
 sessionUrl = null;
 $('reference').removeAttribute('src');
 setDrawingFocus(false);
 if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
 if (returnBoard) openBoard(returnBoard);
 else renderLibrary();
}

document.addEventListener('DOMContentLoaded', () => {
 $('single-study-home').onclick = () => openSingleStudy();
 $('single-study-board').onclick = () => openSingleStudy(selected);
 $('end-session').onclick = () => singleStudy ? closeSingleStudy() : finishPhase({end:true});
 $('study-reference').ontoggle = renderStudyGallery;
 $('study-upload').onclick = () => $('study-file').click();
 $('study-file').onchange = event => loadStudyFile(event.target.files[0]);
 $('study-title').oninput = event => event.target.setCustomValidity('');
 $('study-form').onsubmit = event => {
  event.preventDefault();
  saveSingleStudy();
 };
 $('study-add').onclick = () => saveSingleStudy($('study-board').value);
 document.addEventListener('paste', event => {
  if (!singleStudy || event.target?.closest?.('input, textarea, [contenteditable]')) return;
  const [file] = clipboardImages(event.clipboardData);
  if (!file) return;
  event.preventDefault();
  loadStudyFile(file);
 });
});
