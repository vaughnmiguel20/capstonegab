/* ============================================================
   Barangay UCAB Portal – Master Script
   (Cleaned + Fixed + Modern Chatbot Added)
   ============================================================ */

const USE_FIREBASE = false;

/* -----------------------------------------
   DATA STORAGE
----------------------------------------- */
let requests = [];
let concerns = [];
let announcements = [];
let adminAccounts = [];
let currentAdmin = null;

/* -----------------------------------------
   BASIC HELPERS
----------------------------------------- */
function loadAll() {
  requests = JSON.parse(localStorage.getItem('requests') || '[]');
  concerns = JSON.parse(localStorage.getItem('concerns') || '[]');
  announcements = JSON.parse(localStorage.getItem('announcements') || '[]');
  adminAccounts = JSON.parse(localStorage.getItem('adminAccounts') || '[]');
  currentAdmin = JSON.parse(localStorage.getItem('currentAdmin') || 'null');
  createDefaultAdminIfMissing();
}

function persistAll() {
  localStorage.setItem('requests', JSON.stringify(requests));
  localStorage.setItem('concerns', JSON.stringify(concerns));
  localStorage.setItem('announcements', JSON.stringify(announcements));
  localStorage.setItem('adminAccounts', JSON.stringify(adminAccounts));
  localStorage.setItem('currentAdmin', JSON.stringify(currentAdmin));
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function statusBadgeHtml(status) {
  const s = (status || "").toLowerCase();
  if (["done", "approved", "resolved", "enrolled"].includes(s))
    return `<span class="badge done">${escapeHtml(status)}</span>`;
  if (["declined", "rejected"].includes(s))
    return `<span class="badge declined">${escapeHtml(status)}</span>`;
  return `<span class="badge pending">${escapeHtml(status)}</span>`;
}

/* -----------------------------------------
   DEFAULT ADMIN
----------------------------------------- */
function createDefaultAdminIfMissing() {
  if (adminAccounts.length === 0) {
    adminAccounts = [{
      username: "admin",
      password: "admin123",
      displayName: "Barangay Admin"
    }];
    persistAll();
  }
}

function adminLogin(u, p) {
  const acc = adminAccounts.find(a => a.username === u && a.password === p);
  if (!acc) return false;

  currentAdmin = {
    username: acc.username,
    displayName: acc.displayName,
    loggedAt: new Date().toISOString()
  };
  persistAll();
  return true;
}

function isAdminLoggedIn() {
  return !!currentAdmin;
}

function currentAdminName() {
  return currentAdmin ? currentAdmin.displayName : "";
}

function adminLogout() {
  currentAdmin = null;
  persistAll();
  location.href = "admin-login.html";
}

/* -----------------------------------------
   REQUEST SYSTEM
----------------------------------------- */
function addRequest(name, type, desc = "", extra = {}) {
  const id = requests.length ? Math.max(...requests.map(r => r.id)) + 1 : 1;
  const now = new Date().toISOString();

  requests.push({
    id, name, type,
    desc,
    status: "Pending",
    actionTaken: "",
    createdAt: now,
    updatedAt: now,
    lrn: extra.lrn || ""
  });

  persistAll();
  renderRequestsTable();
  renderAdminDashboard();
}

function adminUpdateRequest(id, newStatus, actionTaken) {
  const r = requests.find(x => x.id === id);
  if (!r) return false;

  r.status = newStatus;
  r.actionTaken = actionTaken;
  r.updatedAt = new Date().toISOString();

  persistAll();
  renderRequestsTable();
  renderAdminDashboard();
  return true;
}

function deleteRequest(id) {
  if (!confirm("Delete request?")) return;
  requests = requests.filter(r => r.id !== id);
  persistAll();
  renderRequestsTable();
  renderAdminDashboard();
}

/* -----------------------------------------
   CONCERNS SYSTEM
----------------------------------------- */
const CONCERN_CATEGORIES = [
  "Garbage", "Road & Infrastructure", "Water Supply",
  "Lighting/Electric", "Peace & Order", "Health", "Others"
];
const CONCERN_PRIORITIES = ["Low", "Medium", "High", "Critical"];
const ASSIGNEES = [
  "Barangay Captain", "SK Chairperson", "Secretary",
  "Treasurer", "Health Worker", "Barangay Tanod", "Maintenance Team"
];

function addConcern(name, issue, options = {}) {
  const id = concerns.length ? Math.max(...concerns.map(c => c.id)) + 1 : 1;
  const now = new Date().toISOString();

  concerns.push({
    id, name, issue,
    status: "Pending",
    category: options.category || "Others",
    priority: options.priority || "Low",
    assignee: options.assignee || "",
    imageData: options.imageData || null,
    actionTaken: "",
    createdAt: now,
    updatedAt: now,
    timeline: [{ event: "Submitted", at: now, by: name }]
  });

  persistAll();
  renderConcernsTable();
  renderUserConcerns();
  updatePendingBadge();
}

function adminUpdateConcern(id, updates) {
  const c = concerns.find(x => x.id === id);
  if (!c) return false;

  if (updates.status) {
    c.status = updates.status;
    c.timeline.push({
      event: "Status changed to " + updates.status,
      at: new Date().toISOString(),
      by: currentAdminName()
    });
  }

  if (updates.assignee !== undefined) {
    c.assignee = updates.assignee;
  }

  if (updates.category !== undefined) c.category = updates.category;
  if (updates.priority !== undefined) c.priority = updates.priority;
  if (updates.actionTaken !== undefined) c.actionTaken = updates.actionTaken;

  c.updatedAt = new Date().toISOString();

  persistAll();
  renderConcernsTable();
  renderUserConcerns();
  updatePendingBadge();
  return true;
}

function deleteConcern(id) {
  if (!confirm("Delete concern?")) return;
  concerns = concerns.filter(c => c.id !== id);
  persistAll();
  renderConcernsTable();
  renderUserConcerns();
  updatePendingBadge();
}

/* -----------------------------------------
   ANNOUNCEMENTS
----------------------------------------- */
function addAnnouncement(title, content) {
  announcements.unshift({
    title,
    content,
    createdAt: new Date().toISOString()
  });
  persistAll();
  renderAnnouncements();
  renderAdminAnnouncements();
}

function deleteAnnouncement(i) {
  announcements.splice(i, 1);
  persistAll();
  renderAnnouncements();
  renderAdminAnnouncements();
}

/* -----------------------------------------
   RENDERS (Tables, Cards, Panels)
----------------------------------------- */

function renderRequestsTable() {
  const tbody = document.querySelector("#requests-table tbody");
  if (tbody) {
    tbody.innerHTML = "";
    requests.slice().reverse().forEach(r => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${r.id}</td>
        <td>${escapeHtml(r.name)}</td>
        <td>${escapeHtml(r.type)}</td>
        <td>${statusBadgeHtml(r.status)}</td>
        <td>${escapeHtml(r.actionTaken || "—")}</td>
        <td>${new Date(r.createdAt).toLocaleString()}</td>
      `;
      tbody.appendChild(tr);
    });
  }
}

function renderConcernsTable() {
  const table = document.querySelector("#concerns-table");
  if (!table) return;

  table.innerHTML = "";

  concerns.slice().reverse().forEach(c => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.id}</td>
      <td><strong>${escapeHtml(c.name)}</strong></td>
      <td>${escapeHtml(c.issue)}</td>
      <td>${statusBadgeHtml(c.status)}</td>
      <td>${new Date(c.updatedAt).toLocaleString()}</td>
    `;
    table.appendChild(tr);
  });
}

function renderUserConcerns() {
  const list = document.getElementById("user-concerns");
  if (!list) return;

  list.innerHTML = "";
  concerns.slice().reverse().forEach(c => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${escapeHtml(c.name)}</h3>
      <p>${escapeHtml(c.issue)}</p>
      <p>Status: ${escapeHtml(c.status)}</p>
    `;
    list.appendChild(card);
  });
}

function renderAnnouncements() {
  const cont = document.getElementById("announcements");
  if (!cont) return;

  cont.innerHTML = "";
  announcements.forEach(a => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${escapeHtml(a.title)}</h3>
      <p>${escapeHtml(a.content)}</p>
    `;
    cont.appendChild(card);
  });
}

function renderAdminAnnouncements() {
  const cont = document.getElementById("announcements-list");
  if (!cont) return;
  cont.innerHTML = "";

  announcements.forEach((a, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(a.title)}</td>
      <td>${escapeHtml(a.content)}</td>
      <td>${new Date(a.createdAt).toLocaleString()}</td>
      <td><button class="btn ghost" onclick="deleteAnnouncement(${i})">Delete</button></td>
    `;
    cont.appendChild(tr);
  });
}

function updatePendingBadge() {
  const count = concerns.filter(c => c.status === "Pending").length;
  const badges = document.querySelectorAll(".pending-badge");
  badges.forEach(b => b.textContent = count > 0 ? count : "");
}

function renderAdminDashboard() {
  const totalR = document.getElementById("total-requests");
  if (totalR) totalR.textContent = requests.length;
}

/* -----------------------------------------
   EXPORT CSV
----------------------------------------- */
function exportConcernsToCSV() {
  if (concerns.length === 0) return alert("No concerns.");
}

/* -----------------------------------------
   INIT PAGE
----------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  loadAll();

  renderRequestsTable();
  renderConcernsTable();
  renderAnnouncements();
  renderUserConcerns();
  renderAdminDashboard();

});

/* ============================================================
       NEW MODERN CHATBOT (MESSENGER STYLE)
============================================================ */

const chatOpen = document.getElementById("chatbotOpenBtn");
const chatClose = document.getElementById("chatbotCloseBtn");
const chatPanel = document.getElementById("chatbotPanel");
const chatBox = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const chatSend = document.getElementById("chatSendBtn");

// open chatbot
chatOpen.onclick = () => {
  chatPanel.style.display = "flex";
};

// close chatbot
chatClose.onclick = () => {
  chatPanel.style.display = "none";
};

// send message
chatSend.onclick = sendMessage;
chatInput.addEventListener("keydown", e => {
  if (e.key === "Enter") sendMessage();
});

// We make this 'async' so it can wait for the AI to reply
async function sendMessage() {
  const msg = chatInput.value.trim();
  if (!msg) return;

  // 1. Show the user's message immediately
  addChatBubble(msg, "user");
  chatInput.value = ""; // Clear the input box

  // 2. Add a temporary "Thinking..." bubble so the user knows it's working
  const typingId = "typing-" + Date.now();
  const typingBubble = document.createElement("div");
  typingBubble.className = "msg bot";
  typingBubble.id = typingId;
  typingBubble.innerText = "Thinking...";
  chatBox.appendChild(typingBubble);
  chatBox.scrollTop = chatBox.scrollHeight;

  // 3. Ask the Real AI and wait for the response
  const reply = await barangayBot(msg);

  // 4. Remove the "Thinking..." bubble and show the real answer
  document.getElementById(typingId).remove();
  addChatBubble(reply, "bot");
}

/* -----------------------------------------
   Helpers for Chat Bubble
----------------------------------------- */
function addChatBubble(text, type) {
  const bubble = document.createElement("div");
  bubble.className = "msg " + type;
  bubble.innerHTML = text; // allow HTML tags
  chatBox.appendChild(bubble);
  chatBox.scrollTop = chatBox.scrollHeight;
}

/* -----------------------------------------
   Real AI Integration (Google Gemini)
----------------------------------------- */
async function barangayBot(message) {
  // PASTE YOUR API KEY HERE inside the quotes:

  const apiKey = "AIzaSyBt4Dm71g8uu-g5AJElwcsQTK4oogyRQbk";

  // This is the specific AI model we are asking
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  // Here, we give the AI a "Personality" and instructions on how to act
  const systemPrompt = `You are a helpful, polite, and friendly virtual assistant for Barangay UCAB. 
  Answer questions clearly and thoroughly. Use appropriate and friendly emojis in your responses to sound like excellent customer service but do not overuse😊.
  If they ask about garbage, say Mon/Wed/Fri at 7 AM. 
  If you don't know the answer, politely tell them to visit the Barangay Hall.`;

  try {
    // Send the message to Google's server
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${systemPrompt}\n\nUser asks: ${message}` }]
        }]
      })
    });

    const data = await response.json();
    console.log("AI Response data:", data);

    // Extract the AI's reply from the server's response
    if (data.candidates && data.candidates.length > 0) {
      let textLine = data.candidates[0].content.parts[0].text;

      // Convert basic Markdown to HTML
      let formattedText = textLine
        .replace(/\*\*(.*?)\*\*/g, '<strong style="font-size: 1.1em; color: #111;">$1</strong>') // Bold and slightly larger text
        .replace(/\*(.*?)\*/g, '<em>$1</em>')             // Italic text
        .replace(/\n/g, '<br>');                          // Line breaks

      // Make bullet points look nicer
      formattedText = formattedText.replace(/<br>\* /g, '<br>&bull; ');
      formattedText = formattedText.replace(/<br>- /g, '<br>&bull; ');
      if (formattedText.startsWith('* ') || formattedText.startsWith('- ')) {
        formattedText = '&bull; ' + formattedText.substring(2);
      }

      return formattedText;
    } else {
      return "Sorry, I'm having trouble thinking right now. Please try again.";
    }
  } catch (error) {
    console.error("AI Error:", error);
    return "Oops! My system is currently down. Please visit the Barangay Hall for assistance.";
  }
}
