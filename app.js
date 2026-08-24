import {
  db,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy
} from "./firebase.js";

const journalPage=document.getElementById("journalPage");
const dashboardPage=document.getElementById("dashboardPage");

const journalBtn=document.getElementById("journalBtn");
const dashboardBtn=document.getElementById("dashboardBtn");

const streak=document.getElementById("streakCount");
const calendar=document.getElementById("calendar");
const medRate=document.getElementById("medRate");
const medBar=document.getElementById("medBar");

let mood="";
let entries=[];

/* ---------- Tabs ---------- */

journalBtn.onclick=()=>{
  journalPage.classList.remove("hidden");
  dashboardPage.classList.add("hidden");
  journalBtn.classList.add("active");
  dashboardBtn.classList.remove("active");
};

dashboardBtn.onclick=()=>{
  dashboardPage.classList.remove("hidden");
  journalPage.classList.add("hidden");
  dashboardBtn.classList.add("active");
  journalBtn.classList.remove("active");
};

/* ---------- Mood ---------- */

document.querySelectorAll(".mood-btn").forEach(btn=>{
  btn.onclick=()=>{
    document.querySelectorAll(".mood-btn")
      .forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    mood=btn.dataset.mood;
  };
});

/* ---------- Load ---------- */

async function loadEntries(){

  const q=query(collection(db,"checkins"),orderBy("date"));

  const snap=await getDocs(q);

  entries=[];

  snap.forEach(doc=>entries.push(doc.data()));

  updateDashboard();
  hiddenFeature();
}

loadEntries();

/* ---------- Hidden feature ---------- */

function hiddenFeature(){

  const last=entries.slice(-3);

  if(last.length===3 && last.every(x=>x.mood==="low")){

    alert("🤍 Hi my puppy. You've had a few really heavy days. Thank you for staying. I love you endlessly.");

  }

}

/* ---------- Dashboard ---------- */

function updateDashboard(){

  streak.textContent=entries.length;

  const meds=entries.filter(x=>x.meds).length;

  const pct=entries.length?
    Math.round((meds/entries.length)*100):0;

  medRate.textContent=pct+"%";
  medBar.style.width=pct+"%";

  calendar.innerHTML="";

  for(let i=1;i<=35;i++){

    const day=document.createElement("div");
    day.className="day";

    const e=entries.find(x=>new Date(x.date).getDate()===i);

    day.textContent=e?
      (e.mood==="low"?"🌧️":
      e.mood==="okay"?"☁️":"🌤️"):
      i;

    calendar.appendChild(day);

  }

}

/* ---------- Submit ---------- */

document.getElementById("submitBtn").onclick=async()=>{

  if(!mood){
    alert("Choose how your little heart is feeling first 🤍");
    return;
  }

  const need=document.getElementById("need").value;

  if(!need){
    alert("Choose what you need most today 🌸");
    return;
  }

  const wins=[...document.querySelectorAll(".check-grid input:checked")]
    .map(x=>x.value);

  const entry={
    mood,
    need,
    meds:document.getElementById("meds").checked,
    wins,
    hard:document.getElementById("hard").value,
    proud:document.getElementById("proud").value,
    date:new Date().toISOString()
  };

  await addDoc(collection(db,"checkins"),entry);

  const moodText={
    low:"🌧️ Rainy Cat",
    okay:"☁️ Sleepy Puppy",
    better:"🌤️ Zoomies Puppy"
  };

  const message=`🐾 **Dear Suji**

${moodText[mood]}

Need: ${need}
Medication: ${entry.meds?"✅ Yes":"❌ No"}

**Tiny Wins**
${wins.join(", ")||"None"}

**Hardest**
${entry.hard||"-"}

**Proud**
${entry.proud||"-"}

━━━━━━━━━━━━

I love you endlessly 🤍`;

  await fetch("https://discord.com/api/webhooks/1541403765377335368/CN4gZW2CzGd-Zdn-6eKrmL219FLwMY8VHuhDhkdgK7KZ-_W216KF7FDU9BDdbZLOnmbR",{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify({
      content:message
    })
  });
    updateDashboard();

  window.location.href = "thankyou.html";
};
