// Import Firebase modules
import { signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { doc, setDoc, getDoc, onSnapshot, collection, query, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Get Firebase instances from global scope
const firebaseConfig = {
  apiKey: "AIzaSyBxMhG_saa7TqNBgJXvjeT6j-HPTfAMR1g",
  authDomain: "kauhuwimbledon.firebaseapp.com",
  projectId: "kauhuwimbledon",
  storageBucket: "kauhuwimbledon.firebasestorage.app",
  messagingSenderId: "886810418550",
  appId: "1:886810418550:web:e60fab8f3c90cd5fcd6e57",
  measurementId: "G-PBWJXPH84M"
};
// Match data
const matches = [
    {"id": "match1", "time": "13:00", "player1": "Bellucci M.", "player2": "Crawford O."},
    {"id": "match2", "time": "13:00", "player1": "Bonzi B.", "player2": "Medvedev D."},
    {"id": "match3", "time": "13:00", "player1": "Kopriva V.", "player2": "Thompson J."},
    {"id": "match4", "time": "13:00", "player1": "Lehecka J.", "player2": "Dellien H."},
    {"id": "match5", "time": "13:00", "player1": "Mannarino A.", "player2": "O'Connell C."},
    {"id": "match6", "time": "13:00", "player1": "Moeller E.", "player2": "Tiafoe F."},
    {"id": "match7", "time": "13:00", "player1": "Tarvet O.", "player2": "Riedi L."},
    {"id": "match8", "time": "13:00", "player1": "Tien L.", "player2": "Basavareddy N."},
    {"id": "match9", "time": "14:30", "player1": "Bergs Z.", "player2": "Harris L."},
    {"id": "match10", "time": "14:30", "player1": "Norrie C.", "player2": "Bautista R."},
    {"id": "match11", "time": "14:30", "player1": "Popyrin A.", "player2": "Fery A."},
    {"id": "match12", "time": "14:30", "player1": "Rune H.", "player2": "Jarry N."},
    {"id": "match13", "time": "15:00", "player1": "Cerundolo F.", "player2": "Borges N."},
    {"id": "match14", "time": "15:00", "player1": "Darderi L.", "player2": "Safiullin R."},
    {"id": "match15", "time": "15:00", "player1": "Royer V.", "player2": "Tsitsipas S."},
    {"id": "match16", "time": "15:30", "player1": "Fognini F.", "player2": "Alcaraz C."},
    {"id": "match17", "time": "16:00", "player1": "Auger-Aliassime F.", "player2": "Duckworth J."},
    {"id": "match18", "time": "16:00", "player1": "Carreno-Busta P.", "player2": "Rodesch C."},
    {"id": "match19", "time": "16:00", "player1": "Struff J-L.", "player2": "Misolic F."},
    {"id": "match20", "time": "16:30", "player1": "Berrettini M.", "player2": "Majchrzak K."},
    {"id": "match21", "time": "16:30", "player1": "Fearnley J.", "player2": "Fonseca J."},
    {"id": "match22", "time": "16:30", "player1": "Harris B.", "player2": "Lajovic D."},
    {"id": "match23", "time": "16:30", "player1": "McDonald M.", "player2": "Khachanov K."},
    {"id": "match24", "time": "16:30", "player1": "Quinn E.", "player2": "Searle H."},
    {"id": "match25", "time": "16:30", "player1": "Rublev A.", "player2": "Djere L."},
    {"id": "match26", "time": "18:00", "player1": "Arnaldi M.", "player2": "Van De Zandschulp B."},
    {"id": "match27", "time": "18:00", "player1": "Brooksby J.", "player2": "Griekspoor T."},
    {"id": "match28", "time": "18:00", "player1": "Diallo G.", "player2": "Altmaier D."},
    {"id": "match29", "time": "18:00", "player1": "Fritz T.", "player2": "Mpetshi Perricard G."},
    {"id": "match30", "time": "18:00", "player1": "Holt B.", "player2": "Davidovich Fokina A."},
    {"id": "match31", "time": "18:00", "player1": "Mochizuki S.", "player2": "Zeppieri G."},
    {"id": "match32", "time": "19:00", "player1": "Rinderknech A.", "player2": "Zverev A."}
];

// Global state
let currentUser = null;
let isAdmin = false;
let isLocked = false;
let userPicks = {};

// DOM elements
let userNameElement;
let logoutBtn;
let adminControls;
let lockToggle;
let lockStatus;
let lockIndicator;
let lockIndicatorText;
let matchesList;
let adminPicks;
let picksTable;

// Initialize
initializeApp();

function initializeApp() {
  // Grab elements
  userNameElement = document.getElementById('user-name');
  logoutBtn = document.getElementById('logout-btn');
  adminControls = document.getElementById('admin-controls');
  lockToggle = document.getElementById('lock-toggle');
  lockStatus = document.getElementById('lock-status');
  lockIndicator = document.getElementById('lock-indicator');
  lockIndicatorText = document.getElementById('lock-indicator-text');
  matchesList = document.getElementById('matches-list');
  adminPicks = document.getElementById('admin-picks');
  picksTable = document.getElementById('picks-table');

  // Events
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
  if (lockToggle) lockToggle.addEventListener('change', handleLockToggle);

  // Auth listener
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user;
      setupUser(user);
      loadApp();
    }
  });
}

function setupUser(user) {
  isAdmin = user.email && user.email.toLowerCase().includes('pandaplayer');
  const displayName = user.email ? user.email : 'Vieraskäyttäjä';
  if (userNameElement) userNameElement.textContent = displayName;
  if (adminControls) adminControls.classList.toggle('hidden', !isAdmin);
  if (adminPicks) adminPicks.classList.toggle('hidden', !isAdmin);
}

async function loadApp() {
  try {
    await loadMatches();
    await loadUserPicks();
    setupLockListener();
    if (isAdmin) setupAdminPicksListener();
  } catch (e) {
    console.error(e);
  }
}

async function loadMatches() {
  if (!matchesList) return;
  matchesList.innerHTML = matches.map(match => `
    <div class="match-item" data-match-id="${match.id}">
      <div class="match-header"><div class="match-time">${match.time}</div></div>
      <div class="match-players">
        <div class="player-name">${match.player1}</div>
        <div class="match-vs">vs</div>
        <div class="player-name">${match.player2}</div>
      </div>
      <div class="match-betting">
        <div class="bet-option"><input type="radio" id="${match.id}-1" name="${match.id}" value="1"><label for="${match.id}-1">1</label></div>
        <div class="bet-option"><input type="radio" id="${match.id}-2" name="${match.id}" value="2"><label for="${match.id}-2">2</label></div>
      </div>
    </div>`).join('');

  // attach listeners
  matchesList.querySelectorAll('input[type="radio"]').forEach(r => r.addEventListener('change', handlePickChange));
  updateLockUI();
}

async function loadUserPicks() {
  const docRef = doc(db, 'picks', currentUser.uid);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    userPicks = snap.data().picks || {};
    Object.entries(userPicks).forEach(([m, p]) => {
      const rb = document.getElementById(`${m}-${p}`);
      if (rb) rb.checked = true;
    });
  }
}

async function handlePickChange(e) {
  if (isLocked) {
    e.preventDefault();
    return;
  }
  const matchId = e.target.name;
  const pickVal = e.target.value;
  userPicks[matchId] = pickVal;
  const docRef = doc(db, 'picks', currentUser.uid);
  await setDoc(docRef, {
    picks: userPicks,
    lastUpdated: new Date(),
    userEmail: currentUser.email || 'Vieraskäyttäjä'
  }, { merge: true });
}

function setupLockListener() {
  const lockRef = doc(db, 'settings', 'lock');
  onSnapshot(lockRef, (d) => {
    isLocked = d.exists() ? d.data().locked : false;
    updateLockUI();
  });
}

function updateLockUI() {
  if (lockToggle) lockToggle.checked = isLocked;
  if (lockStatus) lockStatus.textContent = isLocked ? 'Vastaukset lukittu' : 'Vastaukset avoinna';
  if (lockIndicatorText) {
    lockIndicatorText.textContent = isLocked ? 'Vastaukset lukittu' : 'Vastaukset avoinna';
    const statusEl = lockIndicator.querySelector('.status');
    statusEl.className = isLocked ? 'status status--error status--locked' : 'status status--success';
  }
  matchesList.querySelectorAll('input[type="radio"]').forEach(r => r.disabled = isLocked);
  matchesList.querySelectorAll('.match-item').forEach(mi => mi.classList.toggle('locked', isLocked));
}

async function handleLockToggle(e) {
  if (!isAdmin) return;
  const newState = e.target.checked;
  const lockRef = doc(db, 'settings', 'lock');
  await setDoc(lockRef, { locked: newState, lastModified: new Date(), modifiedBy: currentUser.email || currentUser.uid });
}

function setupAdminPicksListener() {
  const picksColl = collection(db, 'picks');
  const q = query(picksColl, orderBy('lastUpdated', 'desc'));
  onSnapshot(q, (snap) => updateAdminPicksView(snap.docs));
}

function updateAdminPicksView(docs) {
  if (!picksTable) return;
  let html = `<div class="picks-header"><div>Käyttäjä</div><div>Valintoja</div><div>Viimeksi päivitetty</div></div>`;
  docs.forEach(d => {
    const data = d.data();
    const count = Object.keys(data.picks || {}).length;
    const time = data.lastUpdated ? new Date(data.lastUpdated.seconds*1000).toLocaleString('fi-FI') : '';
    html += `<div class="picks-row"><div class="user-email">${data.userEmail || 'Vieraskäyttäjä'}</div><div class="picks-count">${count}/32</div><div class="picks-timestamp">${time}</div></div>`;
  });
  picksTable.innerHTML = html;
}

async function handleLogout() {
  await signOut(auth);
  window.location.reload();
}
