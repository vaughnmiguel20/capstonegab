function openService(type) {
  if (type === "services") {
    alert("E-Services page coming soon!");
  } else if (type === "officials") {
    alert("Barangay Officials page coming soon!");
  } else if (type === "news") {
    alert("News & Announcements page coming soon!");
  }
}

document.querySelectorAll(".service-card button").forEach(btn => {
  btn.addEventListener("click", () => {
    alert("Service request feature coming soon!");
  });
});

let currentIndex = 0;
const dots = document.querySelectorAll(".dot");

function updateDots() {
  dots.forEach(dot => dot.classList.remove("active"));
  dots[currentIndex].classList.add("active");
}

function nextSlide() {
  currentIndex = (currentIndex + 1) % dots.length;
  updateDots();
}

function prevSlide() {
  currentIndex = (currentIndex - 1 + dots.length) % dots.length;
  updateDots();
}

document.querySelectorAll(".news-card").forEach(card => {
  card.addEventListener("click", () => {
    alert("News article page coming soon!");
  });
});

document.querySelector(".register-form").addEventListener("submit", e => {
  e.preventDefault();
  alert("Account submitted! Await admin approval.");
});

document.querySelector(".scroll-top").addEventListener("click", e => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

function openYoutube() {
  window.open(
    "https://youtu.be/KY8gZCD0Ou0?si=GzNSJ3R0lMddwe1b",
    "_blank"
  );
}

function loginUser(e) {
  e.preventDefault();

  // simulate successful login
  localStorage.setItem("isLoggedIn", "true");

  // redirect back to requested page if exists
  const redirect = localStorage.getItem("redirectAfterLogin");
  if (redirect) {
    localStorage.removeItem("redirectAfterLogin");
    window.location.href = redirect;
  } else {
    window.location.href = "index.html";
  }
}

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
  // (Your friend's current key is here, make sure it is valid)
  const apiKey = "AIzaSyCr4E1S0WIqnZyttSfuGbvaDOTs1A0rFM0";

  // This is the specific AI model we are asking
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  // Here, we give the AI a "Personality" and instructions on how to act
  const systemPrompt = `You are a helpful, polite, and friendly virtual assistant for Barangay UCAB. 
  Answer questions clearly and thoroughly. Use appropriate and friendly emojis in your responses to sound like excellent customer service 😊👍✨.
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



