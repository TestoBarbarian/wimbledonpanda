// Firebase konfiguraatio
const firebaseConfig = {
    apiKey: "AIzaSyBxMhG_saa7TqNBgJXvjeT6j-HPTfAMR1g",
    authDomain: "kauhuwimbledon.firebaseapp.com",
    projectId: "kauhuwimbledon",
    storageBucket: "kauhuwimbledon.firebasestorage.app",
    messagingSenderId: "886810418550",
    appId: "1:886810418550:web:e60fab8f3c90cd5fcd6e57"
};

// Firebase alustus
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Otteludata
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

// Globaalit muuttujat
let currentUser = null;
let isAdmin = false;
let isLocked = false;
let allUserPicks = {};

// DOM elementit
const loginPage = document.getElementById('loginPage');
const mainApp = document.getElementById('mainApp');
const loginForm = document.getElementById('loginForm');
const anonymousBtn = document.getElementById('anonymousBtn');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const userInfo = document.getElementById('userInfo');
const adminTabs = document.getElementById('adminTabs');
const lockStatus = document.getElementById('lockStatus');
const matchesList = document.getElementById('matchesList');

// Käynnistä sovellus kun DOM on valmis
document.addEventListener('DOMContentLoaded', () => {
    console.log('Wimbledon Veikkaus sovellus käynnistetty');
    initializeApp();
});

function initializeApp() {
    // Event listenerit
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    if (anonymousBtn) {
        anonymousBtn.addEventListener('click', handleAnonymousLogin);
    }
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Tab navigation
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => switchTab(button.dataset.tab));
    });

    // Results tab elementit
    const userSearch = document.getElementById('userSearch');
    const sortSelect = document.getElementById('sortSelect');
    if (userSearch) {
        userSearch.addEventListener('input', filterResults);
    }
    if (sortSelect) {
        sortSelect.addEventListener('change', sortResults);
    }

    // Lock tab elementit
    const lockToggle = document.getElementById('lockToggle');
    if (lockToggle) {
        lockToggle.addEventListener('change', handleLockToggle);
    }

    // Modal elementit
    const modalClose = document.querySelector('.modal-close');
    const modalOverlay = document.querySelector('.modal-overlay');
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeModal);
    }

    // Firebase auth state listener
    auth.onAuthStateChanged(user => {
        console.log('Auth state changed:', user);
        if (user) {
            currentUser = user;
            isAdmin = user.email === 'pandaplayer@test.com';
            console.log('User logged in:', user.email || 'Anonymous', 'Is admin:', isAdmin);
            showMainApp();
            setupRealtimeListeners();
        } else {
            console.log('No user logged in');
            showLoginPage();
        }
    });

    // Alusta lock status oletusarvoon
    initializeLockStatus();
}

// Kirjautumisfunktiot
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    console.log('Attempting login with:', email);
    
    if (!email || !password) {
        showError('Syötä sähköposti ja salasana');
        return;
    }
    
    try {
        await auth.signInWithEmailAndPassword(email, password);
        console.log('Login successful');
    } catch (error) {
        console.error('Kirjautumisvirhe:', error);
        showError('Kirjautuminen epäonnistui. Tarkista tiedot.');
    }
}

async function handleAnonymousLogin() {
    console.log('Attempting anonymous login');
    try {
        await auth.signInAnonymously();
        console.log('Anonymous login successful');
    } catch (error) {
        console.error('Anonyymi kirjautuminen epäonnistui:', error);
        showError('Anonyymi kirjautuminen epäonnistui');
    }
}

async function handleLogout() {
    try {
        await auth.signOut();
        console.log('Logout successful');
    } catch (error) {
        console.error('Uloskirjautumisvirhe:', error);
    }
}

// UI näyttöfunktiot
function showLoginPage() {
    console.log('Showing login page');
    if (loginPage) loginPage.classList.remove('hidden');
    if (mainApp) mainApp.classList.add('hidden');
    clearError();
}

function showMainApp() {
    console.log('Showing main app');
    if (loginPage) loginPage.classList.add('hidden');
    if (mainApp) mainApp.classList.remove('hidden');
    
    // Päivitä käyttäjätiedot
    updateUserInfo();
    
    // Näytä admin-välilehdet tarvittaessa
    if (isAdmin && adminTabs) {
        adminTabs.classList.remove('hidden');
    } else if (adminTabs) {
        adminTabs.classList.add('hidden');
        switchTab('matches'); // Varmista että peruskäyttäjä näkee ottelut
    }
    
    // Lataa ottelut
    loadMatches();
}

function updateUserInfo() {
    if (!currentUser || !userInfo) return;
    
    const displayName = currentUser.displayName || 
                       currentUser.email || 
                       `Anonyymi käyttäjä`;
    userInfo.textContent = displayName;
    console.log('Updated user info:', displayName);
}

function showError(message) {
    if (loginError) {
        loginError.textContent = message;
        loginError.classList.remove('hidden');
    }
}

function clearError() {
    if (loginError) {
        loginError.classList.add('hidden');
    }
}

// Tab navigation
function switchTab(tabName) {
    console.log('Switching to tab:', tabName);
    
    // Päivitä tab napit
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    // Päivitä tab sisältö
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}Tab`);
    });
    
    // Lataa tab-kohtainen data
    if (tabName === 'results' && isAdmin) {
        loadResultsData();
    }
}

// Ottelujen lataus ja näyttö
function loadMatches() {
    console.log('Loading matches');
    if (!matchesList) return;
    
    matchesList.innerHTML = '';
    
    matches.forEach(match => {
        const matchCard = createMatchCard(match);
        matchesList.appendChild(matchCard);
    });
    
    console.log('Loaded', matches.length, 'matches');
}

function createMatchCard(match) {
    const div = document.createElement('div');
    div.className = 'match-card';
    div.dataset.matchId = match.id;
    
    div.innerHTML = `
        <div class="match-info">
            <div class="match-time">${match.time}</div>
            <div class="match-players">
                ${match.player1} <span class="match-vs">vs</span> ${match.player2}
            </div>
            <div class="match-controls">
                <label class="player-option">
                    <input type="radio" name="match_${match.id}" value="1" ${isLocked ? 'disabled' : ''}>
                    <span>1</span>
                </label>
                <label class="player-option">
                    <input type="radio" name="match_${match.id}" value="2" ${isLocked ? 'disabled' : ''}>
                    <span>2</span>
                </label>
                <div class="lock-indicator ${isLocked ? 'locked' : 'open'}"></div>
            </div>
        </div>
    `;
    
    if (isLocked) {
        div.classList.add('locked');
    }
    
    // Lisää event listenerit valinnoille
    const radioButtons = div.querySelectorAll('input[type="radio"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', () => savePick(match.id, radio.value));
    });
    
    return div;
}

// Valintojen tallentaminen
async function savePick(matchId, choice) {
    if (isLocked || !currentUser) {
        console.log('Cannot save pick - locked or no user');
        return;
    }
    
    console.log('Saving pick:', matchId, choice);
    
    try {
        const userPicksRef = db.collection('picks').doc(currentUser.uid);
        const displayName = currentUser.displayName || 
                           currentUser.email || 
                           `Anonyymi_${currentUser.uid.substring(0, 8)}`;
        
        await userPicksRef.set({
            displayName: displayName,
            picks: {
                [matchId]: choice
            },
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        console.log('Pick saved successfully');
        
    } catch (error) {
        console.error('Valinnan tallentaminen epäonnistui:', error);
    }
}

// Lock status alustus
function initializeLockStatus() {
    // Aseta oletusarvo
    isLocked = false;
    updateLockStatus();
    
    // Yritä luoda lock dokumentti jos se ei ole olemassa
    if (currentUser && isAdmin) {
        db.collection('settings').doc('lock').get()
            .then(doc => {
                if (!doc.exists) {
                    return db.collection('settings').doc('lock').set({
                        locked: false,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
            })
            .catch(error => {
                console.log('Could not initialize lock status:', error);
            });
    }
}

// Reaaliaikaiset kuuntelijat
function setupRealtimeListeners() {
    console.log('Setting up realtime listeners');
    
    // Kuuntele lukituksen tilaa
    db.collection('settings').doc('lock').onSnapshot(doc => {
        if (doc.exists) {
            isLocked = doc.data().locked || false;
            console.log('Lock status updated:', isLocked);
            updateLockStatus();
        }
    }, error => {
        console.log('Error listening to lock status:', error);
    });
    
    // Kuuntele käyttäjän omia valintoja
    if (currentUser) {
        db.collection('picks').doc(currentUser.uid).onSnapshot(doc => {
            if (doc.exists) {
                const picks = doc.data().picks || {};
                console.log('User picks updated:', picks);
                updateUserPicks(picks);
            }
        }, error => {
            console.log('Error listening to user picks:', error);
        });
    }
    
    // Admin: kuuntele kaikkien käyttäjien valintoja
    if (isAdmin) {
        db.collection('picks').onSnapshot(snapshot => {
            allUserPicks = {};
            snapshot.docs.forEach(doc => {
                allUserPicks[doc.id] = doc.data();
            });
            console.log('All user picks updated:', Object.keys(allUserPicks).length, 'users');
            updateResultsTable();
        }, error => {
            console.log('Error listening to all picks:', error);
        });
    }
}

function updateLockStatus() {
    const statusElements = document.querySelectorAll('#lockStatus .status');
    const lockIndicators = document.querySelectorAll('.lock-indicator');
    const radioButtons = document.querySelectorAll('input[type="radio"]');
    
    statusElements.forEach(status => {
        if (isLocked) {
            status.className = 'status status--error';
            status.textContent = 'Vastaukset lukittu';
        } else {
            status.className = 'status status--success';
            status.textContent = 'Vastaukset avoinna';
        }
    });
    
    lockIndicators.forEach(indicator => {
        indicator.className = `lock-indicator ${isLocked ? 'locked' : 'open'}`;
    });
    
    radioButtons.forEach(radio => {
        radio.disabled = isLocked;
    });
    
    // Päivitä match cardit
    document.querySelectorAll('.match-card').forEach(card => {
        card.classList.toggle('locked', isLocked);
    });
    
    // Päivitä admin lock toggle
    const lockToggle = document.getElementById('lockToggle');
    const lockToggleLabel = document.getElementById('lockToggleLabel');
    const lockStatusIndicator = document.getElementById('lockStatusIndicator');
    
    if (lockToggle) {
        lockToggle.checked = isLocked;
    }
    if (lockToggleLabel) {
        lockToggleLabel.textContent = isLocked ? 'Vastaukset lukittu' : 'Vastaukset avoinna';
    }
    if (lockStatusIndicator) {
        const statusDiv = lockStatusIndicator.querySelector('.status');
        if (statusDiv) {
            if (isLocked) {
                statusDiv.className = 'status status--error';
                statusDiv.textContent = 'Lukittu';
            } else {
                statusDiv.className = 'status status--success';
                statusDiv.textContent = 'Aktiivinen';
            }
        }
    }
}

function updateUserPicks(picks) {
    Object.keys(picks).forEach(matchId => {
        const radio = document.querySelector(`input[name="match_${matchId}"][value="${picks[matchId]}"]`);
        if (radio) {
            radio.checked = true;
        }
    });
}

// Admin lock toggle
async function handleLockToggle() {
    if (!isAdmin) return;
    
    const lockToggle = document.getElementById('lockToggle');
    const newLockState = lockToggle.checked;
    
    console.log('Toggling lock to:', newLockState);
    
    try {
        await db.collection('settings').doc('lock').set({
            locked: newLockState,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('Lock status updated successfully');
    } catch (error) {
        console.error('Lukituksen päivitys epäonnistui:', error);
        lockToggle.checked = !newLockState; // Palauta edellinen tila
    }
}

// Results taulukko (ADMIN)
function loadResultsData() {
    if (!isAdmin) return;
    console.log('Loading results data');
    updateResultsTable();
}

function updateResultsTable() {
    const resultsTableBody = document.getElementById('resultsTableBody');
    const totalUsersSpan = document.getElementById('totalUsers');
    const completedUsersSpan = document.getElementById('completedUsers');
    const userSearch = document.getElementById('userSearch');
    const sortSelect = document.getElementById('sortSelect');
    
    if (!isAdmin || !resultsTableBody) return;
    
    const users = Object.entries(allUserPicks);
    const totalUsers = users.length;
    let completedUsers = 0;
    
    // Päivitä yhteenveto
    if (totalUsersSpan) totalUsersSpan.textContent = totalUsers;
    
    if (totalUsers === 0) {
        resultsTableBody.innerHTML = `
            <tr class="loading-row">
                <td colspan="5" class="loading-cell">Ei käyttäjiä vielä</td>
            </tr>
        `;
        return;
    }
    
    // Lajittele ja suodata käyttäjät
    let filteredUsers = users;
    
    // Haku
    const searchTerm = userSearch ? userSearch.value.toLowerCase() : '';
    if (searchTerm) {
        filteredUsers = filteredUsers.filter(([uid, data]) => 
            data.displayName.toLowerCase().includes(searchTerm)
        );
    }
    
    // Järjestä
    const sortBy = sortSelect ? sortSelect.value : 'name';
    filteredUsers.sort(([uidA, dataA], [uidB, dataB]) => {
        switch (sortBy) {
            case 'name':
                return dataA.displayName.localeCompare(dataB.displayName);
            case 'timestamp':
                const timeA = dataA.timestamp ? dataA.timestamp.toDate() : new Date(0);
                const timeB = dataB.timestamp ? dataB.timestamp.toDate() : new Date(0);
                return timeB - timeA;
            case 'picks':
                const picksA = Object.keys(dataA.picks || {}).length;
                const picksB = Object.keys(dataB.picks || {}).length;
                return picksB - picksA;
            default:
                return 0;
        }
    });
    
    // Luo taulukkorivit
    resultsTableBody.innerHTML = '';
    
    filteredUsers.forEach(([uid, userData]) => {
        const picksCount = Object.keys(userData.picks || {}).length;
        const isComplete = picksCount === 32;
        if (isComplete) completedUsers++;
        
        const timestamp = userData.timestamp ? 
            formatTimestamp(userData.timestamp.toDate()) : 
            'Ei aikaleimaa';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="user-name">${userData.displayName}</div>
            </td>
            <td>
                <div class="timestamp">${timestamp}</div>
            </td>
            <td>
                <div class="picks-count">
                    ${picksCount}<span class="total">/32</span>
                </div>
            </td>
            <td>
                <div class="user-status">
                    <div class="status-dot ${isComplete ? 'complete' : picksCount > 0 ? 'partial' : 'none'}"></div>
                    ${isComplete ? 'Valmis' : picksCount > 0 ? 'Kesken' : 'Ei aloitettu'}
                </div>
            </td>
            <td>
                <button class="btn btn--primary btn--sm show-picks-btn" data-uid="${uid}">
                    Näytä valinnat
                </button>
            </td>
        `;
        
        // Lisää event listener "Näytä valinnat" painikkeelle
        const showPicksBtn = row.querySelector('.show-picks-btn');
        showPicksBtn.addEventListener('click', () => showUserPicks(uid, userData));
        
        resultsTableBody.appendChild(row);
    });
    
    // Päivitä yhteenveto
    if (completedUsersSpan) completedUsersSpan.textContent = completedUsers;
    
    console.log('Results table updated:', filteredUsers.length, 'users displayed');
}

function formatTimestamp(date) {
    return date.toLocaleString('fi-FI', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function filterResults() {
    updateResultsTable();
}

function sortResults() {
    updateResultsTable();
}

// Modal käyttäjän valinnoille
function showUserPicks(uid, userData) {
    const picksModal = document.getElementById('picksModal');
    const modalUserName = document.getElementById('modalUserName');
    const modalPicksList = document.getElementById('modalPicksList');
    
    if (!picksModal || !modalUserName || !modalPicksList) return;
    
    console.log('Showing picks for user:', userData.displayName);
    
    modalUserName.textContent = `${userData.displayName} - Valinnat`;
    modalPicksList.innerHTML = '';
    
    const userPicks = userData.picks || {};
    
    matches.forEach(match => {
        const userChoice = userPicks[match.id];
        const div = document.createElement('div');
        div.className = 'modal-pick-item';
        
        let choiceDisplay = '';
        let choiceClass = 'none';
        
        if (userChoice === '1') {
            choiceDisplay = `Pelaaja 1: ${match.player1}`;
            choiceClass = 'player1';
        } else if (userChoice === '2') {
            choiceDisplay = `Pelaaja 2: ${match.player2}`;
            choiceClass = 'player2';
        } else {
            choiceDisplay = 'Ei valintaa';
            choiceClass = 'none';
        }
        
        div.innerHTML = `
            <div class="modal-match-time">${match.time}</div>
            <div class="modal-match-players">
                ${match.player1} vs ${match.player2}
            </div>
            <div class="modal-pick-choice ${choiceClass}">
                ${choiceDisplay}
            </div>
        `;
        
        modalPicksList.appendChild(div);
    });
    
    picksModal.classList.remove('hidden');
}

function closeModal() {
    const picksModal = document.getElementById('picksModal');
    if (picksModal) {
        picksModal.classList.add('hidden');
    }
}