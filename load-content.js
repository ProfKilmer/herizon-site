// Shared content loader for public-facing pages
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, doc, getDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCQTOZyQnk3fGjvxfaCJzFV6WGhuvZRbl4",
  authDomain: "herizon-site.firebaseapp.com",
  projectId: "herizon-site",
  storageBucket: "herizon-site.firebasestorage.app",
  messagingSenderId: "173370881735",
  appId: "1:173370881735:web:60ea3bc80a2f6fb90d70e2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function esc(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Load team members into team.html
export async function loadTeamContent() {
    try {
        const snap = await getDocs(collection(db, 'team'));
        if (snap.empty) return; // Keep static content as fallback

        const items = [];
        snap.forEach(d => items.push(d.data()));
        const roleOrder = { 'Founder': 0, 'Advisor': 1, 'Teen Board Member': 2 };
        items.sort((a, b) => (roleOrder[a.role] || 99) - (roleOrder[b.role] || 99));

        const founder = items.find(i => i.role === 'Founder');
        const advisors = items.filter(i => i.role === 'Advisor');
        const teens = items.filter(i => i.role === 'Teen Board Member');

        // Update founder
        const founderSection = document.getElementById('founderContent');
        if (founderSection && founder) {
            founderSection.innerHTML = `
                <div class="team-photo-placeholder"><span>Photo Coming Soon</span></div>
                <div class="team-founder-info">
                    <h2>${esc(founder.name)}</h2>
                    <p class="team-role">Founder</p>
                    <p class="team-bio">${esc(founder.bio || 'Bio coming soon.')}</p>
                </div>`;
        }

        // Update advisors
        const advisorGrid = document.getElementById('advisorContent');
        if (advisorGrid && advisors.length > 0) {
            advisorGrid.innerHTML = advisors.map(a => `
                <div class="pillar">
                    <div class="pillar-icon-circle">${esc(a.name.charAt(0))}</div>
                    <h3>${esc(a.name)}</h3>
                    <p class="team-role">Advisor</p>
                    ${a.bio ? '<p>' + esc(a.bio) + '</p>' : ''}
                </div>`).join('');
        }

        // Update teen board
        const teenGrid = document.getElementById('teenContent');
        if (teenGrid && teens.length > 0) {
            teenGrid.innerHTML = teens.map(t => `
                <div class="pillar">
                    <div class="pillar-icon-circle">${esc(t.name.charAt(0))}</div>
                    <h3>${esc(t.name)}</h3>
                    <p class="team-role">Teen Board Member</p>
                    ${t.bio ? '<p>' + esc(t.bio) + '</p>' : ''}
                </div>`).join('');
        }
    } catch (e) { console.log('Using static team content.'); }
}

// Load resources into resources.html
export async function loadResourcesContent() {
    try {
        const snap = await getDocs(collection(db, 'resources'));
        if (snap.empty) return;

        const grid = document.getElementById('resourceGrid');
        if (!grid) return;

        const typeLabels = { book: 'Book', article: 'Article', research: 'Research', advocacy: 'Advocacy' };
        grid.innerHTML = '';
        snap.forEach(d => {
            const item = d.data();
            grid.innerHTML += `
                <div class="resource-card" data-type="${esc(item.type)}">
                    <span class="resource-type">${typeLabels[item.type] || item.type}</span>
                    <h4>${esc(item.title)}</h4>
                    <span class="resource-author">by ${esc(item.author)}</span>
                    <p>${esc(item.description)}</p>
                    ${item.link ? '<p style="margin-top:8px;"><a href="' + esc(item.link) + '" target="_blank" style="color:#c9a84c;">Learn More &rarr;</a></p>' : ''}
                </div>`;
        });
    } catch (e) { console.log('Using static resource content.'); }
}

// Load conference data
export async function loadConferenceContent() {
    try {
        // Conference info
        const infoSnap = await getDoc(doc(db, 'settings', 'conference'));
        if (infoSnap.exists()) {
            const info = infoSnap.data();
            const subtitle = document.getElementById('confSubtitle');
            if (subtitle) {
                const datePart = info.date || '[Date TBD]';
                const locPart = info.location || '[Location TBD]';
                subtitle.textContent = '1st Annual · ' + datePart + ' · ' + locPart;
            }
        }

        // Speakers
        const speakerSnap = await getDocs(collection(db, 'speakers'));
        if (!speakerSnap.empty) {
            const grid = document.getElementById('speakersGrid');
            if (grid) {
                grid.innerHTML = '';
                speakerSnap.forEach(d => {
                    const s = d.data();
                    grid.innerHTML += `
                        <div class="speaker-card">
                            <div class="speaker-avatar">${esc(s.name.charAt(0))}</div>
                            <h4>${esc(s.name)}</h4>
                            <p class="speaker-title">${esc(s.title)}</p>
                            <p>${esc(s.bio)}</p>
                        </div>`;
                });
            }
        }

        // Schedule
        const schedSnap = await getDocs(collection(db, 'schedule'));
        if (!schedSnap.empty) {
            const timeline = document.getElementById('scheduleTimeline');
            if (timeline) {
                const items = [];
                schedSnap.forEach(d => items.push(d.data()));
                items.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
                timeline.innerHTML = items.map(item => `
                    <div class="schedule-card">
                        <p class="time">${esc(item.time)}</p>
                        <h4>${esc(item.title)}</h4>
                        <p>${esc(item.description)}</p>
                    </div>`).join('');
            }
        }
    } catch (e) { console.log('Using static conference content.'); }
}

// Load mission content
export async function loadMissionContent() {
    try {
        const snap = await getDoc(doc(db, 'settings', 'mission'));
        if (!snap.exists()) return;
        const data = snap.data();

        const subtitle = document.getElementById('missionSubtitle');
        if (subtitle && data.subtitle) subtitle.textContent = data.subtitle;

        const p1 = document.getElementById('missionP1');
        if (p1 && data.paragraph1) p1.textContent = data.paragraph1;

        const p2 = document.getElementById('missionP2');
        if (p2 && data.paragraph2) p2.textContent = data.paragraph2;
    } catch (e) { console.log('Using static mission content.'); }
}
