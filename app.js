// --- Kurallar / sabitler ---
const TWO_DIGITS = [25, 40, 50, 60, 75, 90];
const VOWELS = ["A","E","I","İ","O","Ö","U","Ü"];
const LETTERS_29 = ["A","B","C","Ç","D","E","F","G","Ğ","H","I","İ","J","K","L","M","N","O","Ö","P","R","S","Ş","T","U","Ü","V","Y","Z"];
const WEIGHTS = {"A":11,"B":3,"C":2,"Ç":2,"D":4,"E":9,"F":1,"G":3,"Ğ":1,"H":2,"I":5,"İ":7,"J":1,"K":5,"L":6,"M":4,"N":6,"O":2,"Ö":1,"P":2,"R":6,"S":5,"Ş":2,"T":6,"U":3,"Ü":2,"V":2,"Y":3,"Z":2};

// --- Yardımcılar ---
function makeSlots(container, count) {
  container.innerHTML = "";
  const slots = [];
  for (let i=0;i<count;i++) {
    const d = document.createElement("div");
    d.className = "slot";
    d.textContent = "";
    container.appendChild(d);
    slots.push(d);
  }
  return slots;
}

function weightedPick(arr) {
  const total = arr.reduce((s,ch)=>s+(WEIGHTS[ch]||1),0);
  let r = Math.random()*total;
  for (const ch of arr) {
    r -= (WEIGHTS[ch]||1);
    if (r <= 0) return ch;
  }
  return arr[arr.length-1];
}

function shuffle(a) {
  for (let i=a.length-1;i>0;i--) {
    const j = Math.floor(Math.random()*(i+1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function badPattern(nums) {
  const set = new Set(nums);
  if (set.size === 1) return true;
  const sorted = [...nums].sort((a,b)=>a-b);
  return sorted.join(",") === "1,2,3,4,5";
}

// --- Timer (ses yok) ---
function makeTimer({labelEl, pauseBtn, onFinished}) {
  let left = 60;
  let running = false;
  let t = null;

  function render() {
    const m = Math.floor(left/60);
    const s = left%60;
    labelEl.textContent = `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  }
  function stop() {
    running = false;
    if (t) clearTimeout(t);
    t = null;
  }
  function start() {
    if (running) return;
    running = true;
    tick();
  }
  function tick() {
    render();
    if (!running) return;
    if (left <= 0) {
      stop();
      onFinished();
      return;
    }
    left -= 1;
    t = setTimeout(tick, 1000);
  }
  function reset() {
    stop();
    left = 60;
    render();
    pauseBtn.style.display = "none";
    pauseBtn.textContent = "Süreyi durdur";
  }
  function showPause() { pauseBtn.style.display = ""; }
  function toggle() {
    if (running) stop(); else start();
    pauseBtn.textContent = running ? "Süreyi durdur" : "Devam";
  }
  function setLeft(v){ left = v; render(); }

  render();
  return { reset, start, stop, showPause, toggle, setLeft };
}

function showOverlay(overlayEl) {
  overlayEl.classList.remove("hidden");
  setTimeout(()=>overlayEl.classList.add("hidden"), 4000);
}

// --- Tab geçişleri ---
const tabIslem = document.getElementById("tabIslem");
const tabKelime = document.getElementById("tabKelime");
const panelIslem = document.getElementById("panelIslem");
const panelKelime = document.getElementById("panelKelime");

function setTab(which) {
  const isIslem = which === "islem";
  panelIslem.classList.toggle("hidden", !isIslem);
  panelKelime.classList.toggle("hidden", isIslem);
  tabIslem.classList.toggle("active", isIslem);
  tabKelime.classList.toggle("active", !isIslem);
}
tabIslem.onclick = ()=>setTab("islem");
tabKelime.onclick = ()=>setTab("kelime");

// --- İşlem Üret ---
const islemSlots = makeSlots(document.getElementById("islemSlots"), 6);
const islemTarget = document.getElementById("islemTarget");
const islemOverlay = document.getElementById("islemOverlay");
document.getElementById("islemOverlayClose").onclick = ()=>islemOverlay.classList.add("hidden");

let islemAfter = [];
function clearAfter(list){ list.forEach(id=>clearTimeout(id)); list.length=0; }

const islemTimer = makeTimer({
  labelEl: document.getElementById("islemTimer"),
  pauseBtn: document.getElementById("islemPause"),
  onFinished: ()=>showOverlay(islemOverlay)
});
document.getElementById("islemPause").onclick = ()=>islemTimer.toggle();

function newIslem() {
  islemTimer.reset();
  clearAfter(islemAfter);
  islemTarget.textContent = "Hedef:";
  islemSlots.forEach(s=>s.textContent="");

  let singles = Array.from({length:5}, ()=> 1 + Math.floor(Math.random()*9));
  while (badPattern(singles)) {
    singles = Array.from({length:5}, ()=> 1 + Math.floor(Math.random()*9));
  }
  const two = TWO_DIGITS[Math.floor(Math.random()*TWO_DIGITS.length)];
  const target = 301 + Math.floor(Math.random()*(999-301+1));
  const nums = [...singles, two];

  function reveal(i){
    if (i < 6) {
      islemSlots[i].textContent = nums[i];
      islemAfter.push(setTimeout(()=>reveal(i+1), 1000));
    } else {
      islemTarget.textContent = `Hedef: ${target}`;
      islemTimer.showPause();
      islemTimer.setLeft(60);
      islemTimer.start();
    }
  }
  reveal(0);
}
document.getElementById("islemNew").onclick = newIslem;

// --- Kelime Üret ---
const kelimeSlots = makeSlots(document.getElementById("kelimeSlots"), 9);
const kelimeOverlay = document.getElementById("kelimeOverlay");
document.getElementById("kelimeOverlayClose").onclick = ()=>kelimeOverlay.classList.add("hidden");

let kelimeAfter = [];
const kelimeTimer = makeTimer({
  labelEl: document.getElementById("kelimeTimer"),
  pauseBtn: document.getElementById("kelimePause"),
  onFinished: ()=>showOverlay(kelimeOverlay)
});
document.getElementById("kelimePause").onclick = ()=>kelimeTimer.toggle();

function newKelime() {
  kelimeTimer.reset();
  clearAfter(kelimeAfter);
  kelimeSlots.forEach(s=>s.textContent="");

  const vowelCount = Math.random() < 0.5 ? 3 : 4;
  const consonantCount = 8 - vowelCount;

  const vowels = LETTERS_29.filter(ch=>VOWELS.includes(ch));
  const cons = LETTERS_29.filter(ch=>!VOWELS.includes(ch));

  const letters = [];
  for (let i=0;i<vowelCount;i++) letters.push(weightedPick(vowels));
  for (let i=0;i<consonantCount;i++) letters.push(weightedPick(cons));
  shuffle(letters);

  const out = [...letters, "*"]; // joker en sonda

  function reveal(i){
    if (i < 9) {
      kelimeSlots[i].textContent = out[i];
      kelimeAfter.push(setTimeout(()=>reveal(i+1), 1000));
    } else {
      kelimeTimer.showPause();
      kelimeTimer.setLeft(60);
      kelimeTimer.start();
    }
  }
  reveal(0);
}
document.getElementById("kelimeNew").onclick = newKelime;

// başlangıç
setTab("islem");
