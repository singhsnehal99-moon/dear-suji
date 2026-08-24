import {
  db,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy
} from "./firebase.js";

const pets = {
  low: {
    emoji: "🐱",
    title: "Rainy Cat",
    text: "A little kitten curled beside your journal today."
  },
  okay: {
    emoji: "🐶",
    title: "Sleepy Puppy",
    text: "You're my sleepy little puppy. Let's take today one tiny step at a time."
  },
  better: {
    emoji: "🐕",
    title: "Zoomies Puppy",
    text: "MY PUPPY HAS THE ZOOMIES!! I'm celebrating every little win with you."
  }
};

const loveNotes = [
  "You never have to earn my love. 🤍",
  "Even on rainy-cat days, you're still my favourite person.",
  "I'm endlessly proud of you for staying.",
  "Borrow my belief in you until yours comes back.",
  "You make my world softer just by existing. 🐶"
];

let mood = "low";
let hearts = 0;
let entries = [];

loveNote.innerText =
  loveNotes[Math.floor(Math.random()*loveNotes.length)];

document.querySelectorAll(".mood-btn").forEach(btn=>{
  btn.onclick=()=>{
    document.querySelectorAll(".mood-btn")
      .forEach(b=>b.classList.remove("active"));

    btn.classList.add("active");

    mood=btn.dataset.mood;

    petEmoji.innerText=pets[mood].emoji;
    petTitle.innerText=pets[mood].title;
    petMessage.innerText=pets[mood].text;
  }
})

for(let i=1;i<=5;i++){

  const h=document.createElement("span");

  h.innerText="🤍";

  h.onclick=()=>{
    hearts=i;

    [...heartMeter.children].forEach((c,index)=>{
      c.innerText=index<i?"❤️":"🤍";
    })
  }

  heartMeter.appendChild(h);
}

async function loadEntries(){

  const q=query(
    collection(db,"checkins"),
    orderBy("date")
  );

  const snap=await getDocs(q);

  entries=[];

  snap.forEach(doc=>{
    entries.push(doc.data());
  })

  updateDashboard();
  hiddenFeature();
}

loadEntries();

function calculateStreak(){

  if(entries.length===0) return 0;

  let streak=1;

  const sorted=[...entries]
    .sort((a,b)=>new Date(a.date)-new Date(b.date));

  for(let i=sorted.length-1;i>0;i--){

    const diff=
      (new Date(sorted[i])-new Date(sorted[i-1]))
      /(1000*60*60*24);

    if(diff<=1.5) streak++;
    else break;

  }

  return streak;

}

function hiddenFeature(){

  const last3=
    entries.slice(-3);

  if(last3.length<3) return;

  const allRain=
    last3.every(x=>x.mood==="low");

  if(allRain){

    loveNote.innerHTML=
    "Hi my puppy 🤍<br><br>I know it's been a few really heavy days.<br><br>You don't have to be brave with me today. Thank you for staying. I'm so proud of you, and I love you endlessly.";

    petEmoji.innerText="😿";
    petTitle.innerText="Your puppy is sitting beside you today";
    petMessage.innerText="No expectations. Just rest.";
  }

}

submitBtn.onclick=async()=>{

  const wins=
    [...document.querySelectorAll(".check-grid input:checked")]
      .map(x=>x.value);

  const entry={
    name:name.value||"Suji",
    mood,
    need:need.value,
    meds:meds.checked,
    wins,
    hard:hard.value,
    proud:proud.value,
    hearts,
    date:new Date().toISOString()
  };

  await addDoc(collection(db,"checkins"),entry);

  const discordMessage=`
🐾 **Dear Suji**

**${entry.name} checked in today 💜**

🌤 Mood: ${pets[mood].title}

🤍 Needs: ${entry.need}

💊 Medication: ${entry.meds?"✅ Yes":"❌ No"}

❤️ Connection: ${"❤️".repeat(entry.hearts)}

**Tiny wins**
${wins.join(", ")||"None"}

**Hardest**
${entry.hard||"-"}

**Proud**
${entry.proud||"-"}

━━━━━━━━━━━━━━

I love you endlessly.

You never have to earn my love.

I'm so proud of you for choosing another day. 🐶
`;

  await fetch("https://discord.com/api/webhooks/1541403765377335368/CN4gZW2CzGd-Zdn-6eKrmL219FLwMY8VHuhDhkdgK7KZ-_W216KF7FDU9BDdbZLOnmbR",{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify({
      content:discordMessage
    })
  });

  document.body.innerHTML=`
  <div style="padding:50px;text-align:center">
    <div style="font-size:100px">🐶</div>
    <h1 style="color:#8B5CF6">
      Thank you, my puppy.
    </h1>
    <p>I'm so proud of you for checking in today.</p>
    <p>Go drink some water and wrap yourself in something cozy.</p>
    <h2 style="color:#EC4899">
      You are loved beyond measure. 🤍
    </h2>
  </div>`;
}

function updateDashboard(){

  streakCount.innerText=calculateStreak();

  const meds=
    entries.filter(x=>x.meds).length;

  medRate.innerText=
    entries.length?
    Math.round(meds/entries.length*100)+"%":"0%";

  drawCalendar();
}

function drawCalendar(){

  calendar.innerHTML="";

  for(let i=1;i<=35;i++){

    const d=document.createElement("div");
    d.className="day";

    const e=
      entries.find(x=>
        new Date(x.date).getDate()===i
      );

    d.innerHTML=e?
      (e.mood==="low"?"🌧️":e.mood==="okay"?"☁️":"🌤️"):
      i;

    calendar.appendChild(d);

  }

}

journalBtn.onclick=()=>{
  journalPage.classList.remove("hidden");
  dashboardPage.classList.add("hidden");
}

dashboardBtn.onclick=()=>{
  dashboardPage.classList.remove("hidden");
  journalPage.classList.add("hidden");
}
