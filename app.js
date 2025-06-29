// app.js – Wimbledon hupi-veikkaus
// ------------------------------------------------------------
// Firebase Security Rules (add to Firebase console):
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null && request.auth.token.email.matches('^PandaPlayer.*');
    }

    match /settings/lock {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /results/outcome {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /picks/{userId} {
      allow read: if isAdmin() || request.auth.uid == userId;
      allow create, update: if request.auth.uid == userId &&
                           exists(/databases/$(database)/documents/settings/lock) == false ||
                           get(/databases/$(database)/documents/settings/lock).data.locked == false;
    }

    match /scores/{userId} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
*/

// ------------------------------------------------------------
// 1. Firebase & global constants
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  updateProfile,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// *** REPLACE THE CONFIG BELOW WITH YOUR OWN PROJECT CONFIG ***
const firebaseConfig = {
  apiKey: "AIzaSyD_demo_key",
  authDomain: "wimbledon-hupi.firebaseapp.com",
  projectId: "wimbledon-hupi",
  storageBucket: "wimbledon-hupi.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef012345",
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
auth.languageCode = "fi";

const ADMIN_NAME = "PandaPlayer";
const ADMIN_PASSWORD = "TopiPanda987"; // only used for auto-fill demo if needed

// ------------------------------------------------------------
// 2. Match data (static)
const matches = [
  { id: "m1", time: "13:00", p1: "Bellucci M.", p2: "Crawford O." },
  { id: "m2", time: "13:00", p1: "Bonzi B.", p2: "Medvedev D." },
  { id: "m3", time: "13:00", p1: "Kopriva V.", p2: "Thompson J." },
  { id: "m4", time: "13:00", p1: "Lehecka J.", p2: "Dellien H." },
  { id: "m5", time: "13:00", p1: "Mannarino A.", p2: "O'Connell C." },
  { id: "m6", time: "13:00", p1: "Moeller E.", p2: "Tiafoe F." },
  { id: "m7", time: "13:00", p1: "Tarvet O.", p2: "Riedi L." },
  { id: "m8", time: "13:00", p1: "Tien L.", p2: "Basavareddy N." },
  { id: "m9", time: "14:30", p1: "Bergs Z.", p2: "Harris L." },
  { id: "m10", time: "14:30", p1: "Norrie C.", p2: "Bautista R." },
  { id: "m11", time: "14:30", p1: "Popyrin A.", p2: "Fery A." },
  { id: "m12", time: "14:30", p1: "Rune H.", p2: "Jarry N." },
  { id: "m13", time: "15:00", p1: "Cerundolo F.", p2: "Borges N." },
  { id: "m14", time: "15:00", p1: "Darderi L.", p2: "Safiullin R." },
  { id: "m15", time: "15:00", p1: "Royer V.", p2: "Tsitsipas S." },
  { id: "m16", time: "15:30", p1: "Fognini F.", p2: "Alcaraz C." },
  { id: "m17", time: "16:00", p1: "Auger-Aliassime F.", p2: "Duckworth J." },
  { id: "m18", time: "16:00", p1: "Carreno-Busta P.", p2: "Rodesch C." },
  { id: "m19", time: "16:00", p1: "Struff J-L.", p2: "Misolic F." },
  { id: "m20", time: "16:30", p1: "Berrettini M.", p2: "Majchrzak K." },
  { id: "m21", time: "16:30", p1: "Fearnley J.", p2: "Fonseca J." },
  { id: "m22", time: "16:30", p1: "Harris B.", p2: "Lajovic D." },
  { id: "m23", time: "16:30", p1: "McDonald M.", p2: "Khachanov K." },
  { id: "m24", time: "16:30", p1: "Quinn E.", p2: "Searle H." },
  { id: "m25", time: "16:30", p1: "Rublev A.", p2: "Djere L." },
  { id: "m26", time: "18:00", p1: "Arnaldi M.", p2: "Van De Zandschulp B." },
  { id: "m27", time: "18:00", p1: "Brooksby J.", p2: "Griekspoor T." },
  { id: "m28", time: "18:00", p1: "Diallo G.", p2: "Altmaier D." },
  { id: "m29", time: "18:00", p1: "Fritz T.", p2: "Mpetshi Perricard G." },
  { id: "m30", time: "18:00", p1: "Holt B.", p2: "Davidovich Fokina A." },
  { id: "m31", time: "18:00", p1: "Mochizuki S.", p2: "Zeppieri G." },
  { id: "m32", time: "19:00", p1: "Rinderknech A.", p2: "Zverev A." },
];

// ------------------------------------------------------------
// 3. DOM helpers
const $ = (id) => document.getElementById(id);

const loginSection = $("loginSection");
const appSection = $("appSection");

const loginForm = $("loginForm");
const emailInput = $("emailInput");
const passwordInput = $("passwordInput");
const guestBtn = $("guestBtn");
const signOutBtn = $("signOutBtn");
const welcomeText = $("welcomeText");

// User view elements
const userView = $("userView");
const matchTableBody = $("matchTable").querySelector("tbody");
const lockNotice = $("lockNotice");
const savedBadge = $("savedBadge");

// Admin view elements
const adminView = $("adminView");
const lockBtn = $("lockBtn");
const lockState = $("lockState");
const picksTable = $("picksTable");
const resultsTable = $("resultsTable");
const publishResultsBtn = $("publishResultsBtn");
const leaderTable = $("leaderTable");

// ------------------------------------------------------------
// 4. Auth & login flow
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const rawUser = emailInput.value.trim();
  const pwd = passwordInput.value.trim();
  if (!rawUser || !pwd) return alert("Täytä tunnus ja salasana");

  // allow pelkkä käyttäjätunnus -> lisää feikki domain
  const email = rawUser.includes("@") ? rawUser : `${rawUser}@hupi.fi`;
  try {
    await signInWithEmailAndPassword(auth, email, pwd);
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      try {
        await createUserWithEmailAndPassword(auth, email, pwd);
        // aseta displayName = rawUser (ennen @)
        await updateProfile(auth.currentUser, { displayName: rawUser });
      } catch (err2) {
        console.error(err2);
        alert("Kirjautuminen epäonnistui: " + err2.message);
      }
    } else {
      console.error(err);
      alert("Kirjautuminen epäonnistui: " + err.message);
    }
  }
});

guestBtn.addEventListener("click", async () => {
  try {
    await signInAnonymously(auth);
  } catch (err) {
    console.error(err);
    alert("Yhteysvirhe: " + err.message);
  }
});

signOutBtn.addEventListener("click", () => signOut(auth));

// ------------------------------------------------------------
// 5. App state listeners
let lockUnsub = null;
let picksUnsub = null;
let scoresUnsub = null;
let resultsUnsub = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    // takaisin kirjautumiseen
    appSection.classList.add("hidden");
    loginSection.classList.remove("hidden");
    return;
  }

  // ensure displayName for anonyymit
  if (!user.displayName) {
    const name = prompt("Syötä nimimerkki:");
    if (name) {
      await updateProfile(user, { displayName: name });
    }
  }

  loginSection.classList.add("hidden");
  appSection.classList.remove("hidden");
  welcomeText.textContent = `Tervetuloa, ${user.displayName || "pelaaja"}!`;
  signOutBtn.classList.remove("hidden");

  const isAdmin = (user.displayName && user.displayName === ADMIN_NAME) ||
                  (user.email && user.email.startsWith(ADMIN_NAME));
  userView.classList.toggle("hidden", isAdmin);
  adminView.classList.toggle("hidden", !isAdmin);

  // clean previous listeners
  lockUnsub && lockUnsub();
  picksUnsub && picksUnsub();
  scoresUnsub && scoresUnsub();
  resultsUnsub && resultsUnsub();

  // Listen lock
  const lockDocRef = doc(db, "settings", "lock");
  lockUnsub = onSnapshot(lockDocRef, (snap) => {
    const locked = snap.exists() ? snap.data().locked : false;
    applyLockState(locked, isAdmin);
  });

  // USER VIEW SETUP -------------------------------------------------
  if (!isAdmin) {
    buildMatchRows(user);

    // existing picks listener
    const myPickRef = doc(db, "picks", user.uid);
    picksUnsub = onSnapshot(myPickRef, (snap) => {
      if (!snap.exists()) return;
      const picks = snap.data().picks || {};
      matches.forEach((m) => {
        const val = picks[m.id];
        if (val) {
          const radio = document.querySelector(
            `input[name="pick-${m.id}"][value="${val}"]`
          );
          if (radio) radio.checked = true;
        }
      });
    });

    // scores listener to render leaderboard once tulokset olemassa
    scoresUnsub = onSnapshot(collection(db, "scores"), (snap) => {
      const rows = [];
      snap.forEach((doc) => rows.push(doc.data()));
      renderLeaderBoard(rows);
    });
  }

  // ADMIN VIEW SETUP ------------------------------------------------
  if (isAdmin) {
    // lock button state update handled via applyLockState
    lockBtn.onclick = async () => {
      try {
        await setDoc(lockDocRef, { locked: true }, { merge: true });
      } catch (err) {
        alert(err.message);
      }
    };

    // listen picks collection
    picksUnsub = onSnapshot(collection(db, "picks"), (snap) => {
      const data = [];
      snap.forEach((d) => data.push({ uid: d.id, ...d.data() }));
      renderPicksTable(data);
    });

    // results UI
    buildResultsTable();

    const outcomeRef = doc(db, "results", "outcome");
    resultsUnsub = onSnapshot(outcomeRef, (snap) => {
      if (snap.exists()) {
        const outcome = snap.data();
        matches.forEach((m) => {
          const val = outcome[m.id];
          if (val) {
            const radio = document.querySelector(
              `input[name="outcome-${m.id}"][value="${val}"]`
            );
            if (radio) radio.checked = true;
          }
        });
      }
    });

    publishResultsBtn.onclick = async () => {
      const outcome = {};
      let filled = true;
      matches.forEach((m) => {
        const selected = document.querySelector(
          `input[name="outcome-${m.id}"]:checked`
        );
        if (!selected) filled = false;
        outcome[m.id] = selected ? selected.value : null;
      });
      if (!filled) {
        if (!confirm("Kaikkia tuloksia ei ole valittu. Julkaistaan silti?")) {
          return;
        }
      }
      try {
        await setDoc(outcomeRef, outcome, { merge: true });
        await computeScores(outcome);
        alert("Tulokset julkaistu ja pisteet päivitetty!");
      } catch (err) {
        alert(err.message);
      }
    };

    // live leaderboard
    scoresUnsub = onSnapshot(query(collection(db, "scores")), (snap) => {
      const arr = [];
      snap.forEach((d) => arr.push(d.data()));
      renderLeaderBoard(arr, true);
    });
  }
});

// ------------------------------------------------------------
// 6. UI rendering functions
function buildMatchRows(user) {
  matchTableBody.innerHTML = "";
  matches.forEach((match) => {
    const tr = document.createElement("tr");

    // time
    const tdTime = document.createElement("td");
    tdTime.textContent = match.time;
    tr.appendChild(tdTime);

    // player1
    const tdP1 = document.createElement("td");
    tdP1.textContent = match.p1;
    tr.appendChild(tdP1);

    // player2
    const tdP2 = document.createElement("td");
    tdP2.textContent = match.p2;
    tr.appendChild(tdP2);

    // radio picks
    const tdPick = document.createElement("td");
    const gName = `pick-${match.id}`;

    ["1", "2"].forEach((val) => {
      const label = document.createElement("label");
      label.style.marginRight = "8px";
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = gName;
      radio.value = val;
      radio.addEventListener("change", () => savePick(user.uid, user.displayName, match.id, val));
      label.appendChild(radio);
      label.appendChild(document.createTextNode(val));
      tdPick.appendChild(label);
    });

    tr.appendChild(tdPick);
    matchTableBody.appendChild(tr);
  });
}

async function savePick(uid, name, matchId, choice) {
  const docRef = doc(db, "picks", uid);
  try {
    await setDoc(
      docRef,
      {
        displayName: name,
        [`picks.${matchId}`]: choice,
        timestamp: serverTimestamp(),
      },
      { merge: true }
    );
    flashSaved();
  } catch (err) {
    alert("Tallennus epäonnistui: " + err.message);
  }
}

function flashSaved() {
  savedBadge.classList.remove("hidden");
  setTimeout(() => savedBadge.classList.add("hidden"), 1500);
}

function applyLockState(locked, isAdmin) {
  if (!isAdmin) {
    lockNotice.classList.toggle("hidden", !locked);
    // disable radios
    document
      .querySelectorAll("input[type=radio][name^='pick-']")
      .forEach((el) => {
        el.disabled = locked;
      });
  } else {
    lockState.classList.remove("hidden");
    lockState.textContent = locked
      ? "Veikkaukset lukittu"
      : "Veikkaukset vielä auki";
    lockState.className = locked
      ? "status status--success"
      : "status status--warning";
    lockBtn.disabled = locked;
  }
}

function renderPicksTable(data) {
  // header
  let html = "<thead><tr><th>Pelaaja</th><th>Valinnat</th></tr></thead><tbody>";
  data.forEach((row) => {
    const picksStr = Object.entries(row.picks || {})
      .map(([id, v]) => `${id}:${v}`)
      .join(", ");
    html += `<tr><td>${row.displayName || row.uid}</td><td>${picksStr}</td></tr>`;
  });
  html += "</tbody>";
  picksTable.innerHTML = html;
}

function buildResultsTable() {
  let html = "<thead><tr><th>Aika</th><th>Pelaaja 1</th><th>Pelaaja 2</th><th>Tulos</th></tr></thead><tbody>";
  matches.forEach((m) => {
    html += `<tr>
      <td>${m.time}</td>
      <td>${m.p1}</td>
      <td>${m.p2}</td>
      <td>
        <label><input type="radio" name="outcome-${m.id}" value="1"/> 1 </label>
        <label><input type="radio" name="outcome-${m.id}" value="2"/> 2 </label>
      </td>
    </tr>`;
  });
  html += "</tbody>";
  resultsTable.innerHTML = html;
}

function renderLeaderBoard(rows, isAdmin = false) {
  if (!rows || rows.length === 0) {
    leaderTable.innerHTML = "<tbody><tr><td>Ei pisteitä vielä.</td></tr></tbody>";
    return;
  }
  // sort desc
  rows.sort((a, b) => b.points - a.points);
  let html = "<thead><tr><th>Sija</th><th>Pelaaja</th><th>Pisteet</th></tr></thead><tbody>";
  rows.forEach((r, idx) => {
    html += `<tr><td>${idx + 1}</td><td>${r.displayName || r.uid}</td><td>${r.points}</td></tr>`;
  });
  html += "</tbody>";
  leaderTable.innerHTML = html;
  // show table in userView too (append if missing)
  if (!isAdmin) {
    if (!leaderTable.closest("#userView")) {
      userView.appendChild(leaderTable.parentElement.closest(".card") ?? createLeaderCard());
    }
  }
}

function createLeaderCard() {
  const card = document.createElement("div");
  card.className = "card mt-8";
  const header = document.createElement("div");
  header.className = "card__header";
  header.innerHTML = "<h3>Pistetaulukko</h3>";
  const body = document.createElement("div");
  body.className = "card__body overflow-auto";
  body.appendChild(leaderTable);
  card.appendChild(header);
  card.appendChild(body);
  return card;
}

async function computeScores(outcome) {
  if (!outcome) return;
  const pickSnap = await getDocs(collection(db, "picks"));
  for (const docSnap of pickSnap.docs) {
    const data = docSnap.data();
    const picks = data.picks || {};
    let points = 0;
    matches.forEach((m) => {
      if (picks[m.id] && outcome[m.id] && picks[m.id] === outcome[m.id]) {
        points += 1;
      }
    });
    await setDoc(
      doc(db, "scores", docSnap.id),
      { points, displayName: data.displayName || docSnap.id },
      { merge: true }
    );
  }
}
