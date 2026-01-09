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

<script>
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
</script>
