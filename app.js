import {
  db,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy
} from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {

  const journalPage = document.getElementById("journalPage");
  const dashboardPage = document.getElementById("dashboardPage");

  const journalBtn = document.getElementById("journalBtn");
  const dashboardBtn = document.getElementById("dashboardBtn");

  const petEmoji = document.getElementById("petEmoji");
  const petTitle = document.getElementById("petTitle");
  const petMessage = document.getElementById("petMessage");
  const loveNote = document.getElementById("loveNote");

  const streakCount = document.getElementById("streakCount");
  const calendar = document.getElementById("calendar");
  const medRate = document.getElementById("medRate");

  const heartMeter = document.getElementById("heartMeter");
  const submitBtn = document.getElementById("submitBtn");

  const need = document.getElementById("need");
  const meds = document.getElementById("meds");
  const hard = document.getElementById("hard");
  const proud = document.getElementById("proud");

  let mood = "";
  let hearts = 0;
  let entries = [];

  const pets = {
    low: {
      emoji: "🐱",
      title: "Rainy Cat",
      text: "A little kitten curled beside your journal today."
    },
    okay: {
      emoji: "🐶",
      title: "Sleepy Puppy",
      text: "Let's take today one tiny step at a time."
    },
    better: {
      emoji: "🐕",
      title: "Zoomies Puppy",
      text: "MY PUPPY HAS THE ZOOMIES!!"
    }
  };

  const loveNotes = [
    "You never have to earn my love. 🤍",
    "Even on rainy-cat days, you're still my favourite person.",
    "I'm endlessly proud of you for staying.",
    "Borrow my belief in you until yours comes back.",
    "You make my world softer just by existing."
  ];

  petEmoji.textContent = "🐾";
  petTitle.textContent = "Hi my puppy 🤍";
  petMessage.textContent = "Tell me how your little heart is feeling today.";
  loveNote.textContent = loveNotes[Math.floor(Math.random()*loveNotes.length)];

  // Mood buttons
  document.querySelectorAll(".mood-btn").forEach(btn => {

    btn.addEventListener("click", () => {

      document.querySelectorAll(".mood-btn")
        .forEach(b => b.classList.remove("active"));

      btn.classList.add("active");

      mood = btn.dataset.mood;

      petEmoji.textContent = pets[mood].emoji;
      petTitle.textContent = pets[mood].title;
      petMessage.textContent = pets[mood].text;

    });

  });

  // Hearts
  for(let i=1;i<=5;i++){

    const span=document.createElement("span");
    span.textContent="🤍";

    span.onclick=()=>{

      hearts=i;

      [...heartMeter.children].forEach((h,index)=>{
        h.textContent=index<i?"❤️":"🤍";
      });

    }

    heartMeter.appendChild(span);

  }

  // Tabs
  journalBtn.onclick=()=>{

    journalPage.classList.remove("hidden");
    dashboardPage.classList.add("hidden");

    journalBtn.classList.add("active");
    dashboardBtn.classList.remove("active");

  }

  dashboardBtn.onclick=()=>{

    dashboardPage.classList.remove("hidden");
    journalPage.classList.add("hidden");

    dashboardBtn.classList.add("active");
    journalBtn.classList.remove("active");

  }

  async function loadEntries(){

    const q=query(
      collection(db,"checkins"),
      orderBy("date")
    );

    const snap=await getDocs(q);

    entries=[];

    snap.forEach(doc=>entries.push(doc.data()));

    updateDashboard();
    hiddenFeature();

  }

  function hiddenFeature(){

    const last3=entries.slice(-3);

    if(last3.length===3 &&
       last3.every(x=>x.mood==="low")){

      loveNote.innerHTML=`
      Hi my puppy 🤍<br><br>
      I know it's been a few really heavy days.<br><br>
      You don't have to be brave with me today.
      I'm so proud of you and I love you endlessly.
      `;

    }

  }

  function updateDashboard(){

    streakCount.textContent=entries.length;

    const medsTaken=entries.filter(x=>x.meds).length;

    medRate.textContent=
      entries.length?
      Math.round(medsTaken/entries.length*100)+"%":"0%";

    calendar.innerHTML="";

    for(let i=1;i<=35;i++){

      const day=document.createElement("div");
      day.className="day";

      const entry=entries.find(
        x=>new Date(x.date).getDate()===i
      );

      day.textContent=
        entry?
        (entry.mood==="low"?"🌧️":
        entry.mood==="okay"?"☁️":"🌤️"):
        i;

      calendar.appendChild(day);

    }

  }

  submitBtn.onclick=async()=>{

    if(!mood){
      alert("Choose how you're feeling first 🤍");
      return;
    }

    const wins=[...document.querySelectorAll(".check-grid input:checked")]
      .map(x=>x.value);

    const entry={

      name:"Suji",
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

🌤 Mood: ${pets[mood].title}

🤍 Need: ${entry.need}

💊 Medication: ${entry.meds?"Yes":"No"}

❤️ Connection: ${"❤️".repeat(entry.hearts)}

Tiny Wins:
${wins.join(", ")||"None"}

Hardest:
${entry.hard||"-"}

Proud:
${entry.proud||"-"}

━━━━━━━━━━

I love you endlessly. 🤍
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

    alert("Your paw report was sent 🐶");

    loadEntries();

  }

  loadEntries();

});
