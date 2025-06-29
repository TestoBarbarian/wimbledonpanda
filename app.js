// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBxMhG_saa7TqNBgJXvjeT6j-HPTfAMR1g",
    authDomain: "kauhuwimbledon.firebaseapp.com",
    projectId: "kauhuwimbledon",
    storageBucket: "kauhuwimbledon.firebasestorage.app",
    messagingSenderId: "886810418550",
    appId: "1:886810418550:web:e60fab8f3c90cd5fcd6e57",
    measurementId: "G-PBWJXPH84M"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Match data
const matches = [
    {"id": "m1", "time": "13:00", "player1": "Bellucci M.", "player2": "Crawford O."},
    {"id": "m2", "time": "13:00", "player1": "Bonzi B.", "player2": "Medvedev D."},
    {"id": "m3", "time": "13:00", "player1": "Kopriva V.", "player2": "Thompson J."},
    {"id": "m4", "time": "13:00", "player1": "Lehecka J.", "player2": "Dellien H."},
    {"id": "m5", "time": "13:00", "player1": "Mannarino A.", "player2": "O'Connell C."},
    {"id": "m6", "time": "13:00", "player1": "Moeller E.", "player2": "Tiafoe F."},
    {"id": "m7", "time": "13:00", "player1": "Tarvet O.", "player2": "Riedi L."},
    {"id": "m8", "time": "13:00", "player1": "Tien L.", "player2": "Basavareddy N."},
    {"id": "m9", "time": "14:30", "player1": "Bergs Z.", "player2": "Harris L."},
    {"id": "m10", "time": "14:30", "player1": "Norrie C.", "player2": "Bautista R."},
    {"id": "m11", "time": "14:30", "player1": "Popyrin A.", "player2": "Fery A."},
    {"id": "m12", "time": "14:30", "player1": "Rune H.", "player2": "Jarry N."},
    {"id": "m13", "time": "15:00", "player1": "Cerundolo F.", "player2": "Borges N."},
    {"id": "m14", "time": "15:00", "player1": "Darderi L.", "player2": "Safiullin R."},
    {"id": "m15", "time": "15:00", "player1": "Royer V.", "player2": "Tsitsipas S."},
    {"id": "m16", "time": "15:30", "player1": "Fognini F.", "player2": "Alcaraz C."},
    {"id": "m17", "time": "16:00", "player1": "Auger-Aliassime F.", "player2": "Duckworth J."},
    {"id": "m18", "time": "16:00", "player1": "Carreno-Busta P.", "player2": "Rodesch C."},
    {"id": "m19", "time": "16:00", "player1": "Struff J-L.", "player2": "Misolic F."},
    {"id": "m20", "time": "16:30", "player1": "Berrettini M.", "player2": "Majchrzak K."},
    {"id": "m21", "time": "16:30", "player1": "Fearnley J.", "player2": "Fonseca J."},
    {"id": "m22", "time": "16:30", "player1": "Harris B.", "player2": "Lajovic D."},
    {"id": "m23", "time": "16:30", "player1": "McDonald M.", "player2": "Khachanov K."},
    {"id": "m24", "time": "16:30", "player1": "Quinn E.", "player2": "Searle H."},
    {"id": "m25", "time": "16:30", "player1": "Rublev A.", "player2": "Djere L."},
    {"id": "m26", "time": "18:00", "player1": "Arnaldi M.", "player2": "Van De Zandschulp B."},
    {"id": "m27", "time": "18:00", "player1": "Brooksby J.", "player2": "Griekspoor T."},
    {"id": "m28", "time": "18:00", "player1": "Diallo G.", "player2": "Altmaier D."},
    {"id": "m29", "time": "18:00", "player1": "Fritz T.", "player2": "Mpetshi Perricard G."},
    {"id": "m30", "time": "18:00", "player1": "Holt B.", "player2": "Davidovich Fokina A."},
    {"id": "m31", "time": "18:00", "player1": "Mochizuki S.", "player2": "Zeppieri G."},
    {"id": "m32", "time": "19:00", "player1": "Rinderknech A.", "player2": "Zverev A."}
];

// Global state
let currentUser = null;
let isAdmin = false;
let isLocked = false;
let userPicks = {};
let allUserResults = {};

// Admin email
const ADMIN_EMAIL = "pandaplayer@test.com";

// DOM Elements
const loginPage = document.getElementById('loginPage');
const mainApp = document.getElementById('mainApp');
const emailTab = document.getElementById('emailTab');
const anonymousTab = document.getElementById('anonymousTab');
const emailLoginForm = document.getElementById('emailLoginForm');
const anonymousLoginBtn = document.getElementById('anonymousLoginBtn');
const loginError = document.getElementById('loginError');
const userInfo = document.getElementById('userInfo');
const logoutBtn = document.getElementById('logoutBtn');
const adminTabBtn = document.getElementById('adminTab');
const matchesList = document.getElementById('matchesList');
const lockStatus = document.getElementById('lockStatus');
const lockToggle = document.getElementById('lockToggle');
const resultsTableBody = document.getElementById('resultsTableBody');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    console.log('App initializing...');
    setupEventListeners();
    setupAuthListener();
});

function setupEventListeners() {
    // Login tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchLoginTab(btn.dataset.tab));
    });

    // App tab switching
    document.querySelectorAll('.app-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchAppTab(btn.dataset.tab));
    });

    // Email login
    emailLoginForm.addEventListener('submit', handleEmailLogin);

    // Anonymous login
    anonymousLoginBtn.addEventListener('click', handleAnonymousLogin);

    // Logout
    logoutBtn.addEventListener('click', handleLogout);

    // Admin lock toggle
    if (lockToggle) {
        lockToggle.addEventListener('change', handleLockToggle);
    }
}

function switchLoginTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}Tab`).classList.add('active');
    hideError();
}

function switchAppTab(tabName) {
    document.querySelectorAll('.app-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('#mainApp .tab-content').forEach(content => content.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    if (tabName === 'admin') {
        document.getElementById('adminTab-content').classList.add('active');
    } else {
        document.getElementById('matchesTab').classList.add('active');
    }
}

function setupAuthListener() {
    auth.onAuthStateChanged(async (user) => {
        console.log('Auth state changed:', user);
        if (user) {
            currentUser = user;
            isAdmin = user.email === ADMIN_EMAIL;
            console.log('User logged in:', user.displayName || user.email || 'Anonymous', 'Admin:', isAdmin);
            showMainApp();
            setupRealtimeListeners();
        } else {
            console.log('User logged out');
            currentUser = null;
            isAdmin = false;
            showLoginPage();
        }
    });
}

async function handleEmailLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        showError('Syötä sähköposti ja salasana');
        return;
    }

    try {
        hideError();
        console.log('Attempting email login...');
        await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
        console.error('Email login error:', error);
        showError('Kirjautuminen epäonnistui: ' + error.message);
    }
}

async function handleAnonymousLogin() {
    const displayName = document.getElementById('displayName').value.trim();
    
    if (!displayName) {
        showError('Syötä näyttönimi');
        return;
    }

    try {
        hideError();
        console.log('Attempting anonymous login with name:', displayName);
        
        // Sign in anonymously first
        const result = await auth.signInAnonymously();
        console.log('Anonymous auth successful:', result.user.uid);
        
        // Update profile with display name
        await result.user.updateProfile({ 
            displayName: displayName 
        });
        console.log('Display name updated:', displayName);
        
    } catch (error) {
        console.error('Anonymous login error:', error);
        showError('Kirjautuminen epäonnistui: ' + error.message);
    }
}

async function handleLogout() {
    try {
        console.log('Logging out...');
        await auth.signOut();
    } catch (error) {
        console.error('Logout error:', error);
    }
}

function showError(message) {
    loginError.textContent = message;
    loginError.classList.remove('hidden');
}

function hideError() {
    loginError.classList.add('hidden');
}

function showLoginPage() {
    loginPage.classList.remove('hidden');
    mainApp.classList.add('hidden');
    // Clear form fields
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    document.getElementById('displayName').value = '';
}

function showMainApp() {
    loginPage.classList.add('hidden');
    mainApp.classList.remove('hidden');
    
    // Update user info
    const displayName = currentUser.displayName || currentUser.email || 'Anonyymi käyttäjä';
    userInfo.textContent = `Tervetuloa, ${displayName}`;
    
    // Show admin tab if admin
    if (isAdmin) {
        adminTabBtn.classList.remove('hidden');
    } else {
        adminTabBtn.classList.add('hidden');
    }
    
    // Initialize app data
    renderMatches();
    loadUserPicks();
    
    // Set default lock status
    updateLockStatus();
}

function setupRealtimeListeners() {
    // Listen to lock status
    db.collection('settings').doc('lock').onSnapshot(doc => {
        isLocked = doc.exists && doc.data().locked || false;
        updateLockStatus();
        updateMatchesUI();
        
        if (isAdmin && lockToggle) {
            lockToggle.checked = isLocked;
        }
    }, error => {
        console.error('Error listening to lock status:', error);
        // Set default unlocked state if there's an error
        isLocked = false;
        updateLockStatus();
        updateMatchesUI();
    });

    // Listen to all user results (admin only)
    if (isAdmin) {
        db.collection('picks').onSnapshot(snapshot => {
            allUserResults = {};
            snapshot.forEach(doc => {
                allUserResults[doc.id] = doc.data();
            });
            renderAdminResults();
        }, error => {
            console.error('Error listening to picks:', error);
        });
    }
}

function updateLockStatus() {
    const statusIndicator = lockStatus.querySelector('.status-indicator');
    const statusText = lockStatus.querySelector('.status-text');
    
    if (isLocked) {
        statusIndicator.className = 'status-indicator locked';
        statusText.textContent = 'Vedonlyönti lukittu';
    } else {
        statusIndicator.className = 'status-indicator open';
        statusText.textContent = 'Vedonlyönti avoinna';
    }
}

function renderMatches() {
    matchesList.innerHTML = '';
    
    matches.forEach(match => {
        const matchCard = createMatchCard(match);
        matchesList.appendChild(matchCard);
    });
}

function createMatchCard(match) {
    const card = document.createElement('div');
    card.className = 'match-card';
    
    card.innerHTML = `
        <div class="match-header">
            <div class="match-time">${match.time}</div>
        </div>
        <div class="match-players">
            <label class="player-option ${isLocked ? 'disabled' : ''}" data-match="${match.id}" data-pick="1">
                <input type="radio" name="match_${match.id}" value="1" class="player-radio" ${isLocked ? 'disabled' : ''}>
                <span class="player-name">${match.player1}</span>
                <span class="player-number">1</span>
            </label>
            <label class="player-option ${isLocked ? 'disabled' : ''}" data-match="${match.id}" data-pick="2">
                <input type="radio" name="match_${match.id}" value="2" class="player-radio" ${isLocked ? 'disabled' : ''}>
                <span class="player-name">${match.player2}</span>
                <span class="player-number">2</span>
            </label>
        </div>
    `;
    
    // Add click listeners
    const options = card.querySelectorAll('.player-option');
    options.forEach(option => {
        option.addEventListener('click', (e) => {
            if (!isLocked) {
                handlePickSelection(match.id, option.dataset.pick);
            }
        });
    });
    
    return card;
}

function handlePickSelection(matchId, pick) {
    if (isLocked) return;
    
    userPicks[matchId] = pick;
    saveUserPicks();
    updateMatchUI(matchId, pick);
}

async function saveUserPicks() {
    if (!currentUser) return;
    
    try {
        const displayName = currentUser.displayName || currentUser.email || 'Anonyymi käyttäjä';
        await db.collection('picks').doc(currentUser.uid).set({
            displayName: displayName,
            picks: userPicks,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log('Picks saved successfully');
    } catch (error) {
        console.error('Error saving picks:', error);
    }
}

async function loadUserPicks() {
    if (!currentUser) return;
    
    try {
        const doc = await db.collection('picks').doc(currentUser.uid).get();
        if (doc.exists) {
            const data = doc.data();
            userPicks = data.picks || {};
            updateAllMatchesUI();
            console.log('User picks loaded:', Object.keys(userPicks).length, 'picks');
        }
    } catch (error) {
        console.error('Error loading picks:', error);
    }
}

function updateMatchUI(matchId, pick) {
    const options = document.querySelectorAll(`[data-match="${matchId}"]`);
    
    options.forEach(option => {
        option.classList.remove('selected');
        const radio = option.querySelector('input');
        radio.checked = false;
        
        if (option.dataset.pick === pick) {
            option.classList.add('selected');
            radio.checked = true;
        }
    });
}

function updateAllMatchesUI() {
    Object.entries(userPicks).forEach(([matchId, pick]) => {
        updateMatchUI(matchId, pick);
    });
}

function updateMatchesUI() {
    const options = document.querySelectorAll('.player-option');
    const radios = document.querySelectorAll('.player-radio');
    
    options.forEach(option => {
        if (isLocked) {
            option.classList.add('disabled');
        } else {
            option.classList.remove('disabled');
        }
    });
    
    radios.forEach(radio => {
        radio.disabled = isLocked;
    });
}

async function handleLockToggle() {
    if (!isAdmin) return;
    
    try {
        await db.collection('settings').doc('lock').set({
            locked: lockToggle.checked
        });
        console.log('Lock status updated:', lockToggle.checked);
    } catch (error) {
        console.error('Error updating lock status:', error);
        // Revert toggle state on error
        lockToggle.checked = !lockToggle.checked;
    }
}

function renderAdminResults() {
    if (!isAdmin) return;
    
    resultsTableBody.innerHTML = '';
    
    const userEntries = Object.entries(allUserResults);
    
    if (userEntries.length === 0) {
        resultsTableBody.innerHTML = `
            <tr>
                <td colspan="3" class="no-results">Ei tuloksia vielä</td>
            </tr>
        `;
        return;
    }
    
    // Sort by timestamp (newest first)
    userEntries.sort(([,a], [,b]) => {
        const timeA = a.timestamp ? a.timestamp.seconds : 0;
        const timeB = b.timestamp ? b.timestamp.seconds : 0;
        return timeB - timeA;
    });
    
    userEntries.forEach(([userId, userData]) => {
        const row = document.createElement('tr');
        
        const displayName = userData.displayName || 'Tuntematon käyttäjä';
        const picks = userData.picks || {};
        const timestamp = userData.timestamp ? 
            new Date(userData.timestamp.seconds * 1000).toLocaleString('fi-FI') : 
            'Ei aikaleimaa';
        
        // Format picks for display
        const picksCount = Object.keys(picks).length;
        const picksText = picksCount > 0 ? 
            `${picksCount} valintaa: ` + Object.entries(picks)
                .sort(([a], [b]) => {
                    const numA = parseInt(a.substring(1));
                    const numB = parseInt(b.substring(1));
                    return numA - numB;
                })
                .map(([matchId, pick]) => `${matchId}=${pick}`)
                .join(', ') : 
            'Ei valintoja';
        
        row.innerHTML = `
            <td><strong>${displayName}</strong></td>
            <td><span class="user-picks">${picksText}</span></td>
            <td><span class="timestamp">${timestamp}</span></td>
        `;
        
        resultsTableBody.appendChild(row);
    });
    
    console.log('Admin results updated:', userEntries.length, 'users');
}