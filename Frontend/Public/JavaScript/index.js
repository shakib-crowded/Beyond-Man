const slides = document.querySelectorAll(".slide");

let counter = 0;

slides.forEach((slide, index) => {
  slide.style.left = `${index * 100}%`;
});

// Hero Course Card That Show Waiting For Courses

let countdownInterval;

function showBrowseCourseCard() {
  const card = document.getElementById("hero-course-card");
  const overlay = document.getElementById("hero-course-card-overlay");

  // Show card
  card.classList.add("active");
  overlay.classList.add("active");

  // Start countdown
  let secondsLeft = 10;
  const countdownElement = document.getElementById("countdown");
  countdownElement.textContent = secondsLeft;

  countdownInterval = setInterval(() => {
    secondsLeft--;
    countdownElement.textContent = secondsLeft;

    if (secondsLeft <= 0) {
      closeCourseCard();
    }
  }, 1000);
}

function closeCourseCard() {
  const card = document.getElementById("hero-course-card");
  const overlay = document.getElementById("hero-course-card-overlay");

  // Hide card
  card.classList.remove("active");
  overlay.classList.remove("active");

  // Clear countdown
  clearInterval(countdownInterval);
}

// Index.js Date Format
// Shorten all date-format elements
document.querySelectorAll(".date-format").forEach((el) => {
  const date = new Date(el.textContent.trim());
  el.textContent = date.toLocaleDateString("en-GB"); // Format as DD/MM/YYYY
});

// Search Button

const searchBlogs = (event) => {
  event.preventDefault();
};
// User Logout

// function logoutUser() {
//   // Remove authentication data
//   localStorage.removeItem("authToken"); // If stored in Local Storage
//   sessionStorage.removeItem("authToken"); // If stored in Session Storage

//   // Expire the cookie (for cookie-based auth)
//   document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

//   // Redirect to login page
//   window.location.href = "/";
// }
// Show logout modal
function showLogOutCard() {
  // Close mobile menu first (if open)
  const hamburger = document.querySelector(".hamburger");
  const mobileMenu = document.querySelector(".mobile-menu");
  const mobileOverlay = document.querySelector(".mobile-overlay");

  if (hamburger && hamburger.classList.contains("active")) {
    hamburger.classList.remove("active");
    mobileMenu.classList.remove("active");
    mobileOverlay.classList.remove("active");
  }

  // Show logout modal
  const logoutModal = document.getElementById("logoutModal");
  const overlay = document.getElementById("overlay");

  logoutModal.style.display = "flex";
  overlay.style.display = "block";

  // Add show class after a short delay to trigger animation
  setTimeout(() => {
    logoutModal.classList.add("show");
  }, 10);

  // Prevent body scrolling
  document.body.style.overflow = "hidden";
}

// Hide logout modal
function hideLogOutCard() {
  const logoutModal = document.getElementById("logoutModal");
  const overlay = document.getElementById("overlay");

  logoutModal.classList.remove("show");

  // Wait for animation to complete before hiding
  setTimeout(() => {
    logoutModal.style.display = "none";
    overlay.style.display = "none";
    document.body.style.overflow = "";
  }, 300);
}

// Logout functionality
document.getElementById("logoutButton").addEventListener("click", function () {
  fetch("/logout", {
    method: "POST",
    credentials: "include",
  })
    .then((response) => {
      if (response.ok) {
        window.location.href = "/"; // force full page reload
      } else {
        throw new Error("Logout failed");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Logout failed. Please try again.");
    });
});

// Close modal when clicking cancel or overlay
document
  .getElementById("cancelButton")
  .addEventListener("click", hideLogOutCard);
document.getElementById("overlay").addEventListener("click", hideLogOutCard);

// Close modal with Escape key
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    hideLogOutCard();
  }
});
// Flash Card Script
function closeFlash(button) {
  button.parentElement.style.display = "none";
}

setTimeout(() => {
  let flashMessages = document.querySelectorAll(".flash-message");
  flashMessages.forEach((msg) => (msg.style.display = "none"));
}, 3000);

// Toggle Mobile Menu
function toggleMenu() {
  let menu = document.querySelector(".mobile-menu");
  let hamburger = document.querySelector(".hamburger");

  // Toggle open class
  menu.classList.toggle("open");
  hamburger.classList.toggle("open");

  // Open/close menu
  if (menu.classList.contains("open")) {
    menu.style.left = "0";
    document.addEventListener("click", closeMenuOutsideClick);
  } else {
    menu.style.left = "-100%";
    document.removeEventListener("click", closeMenuOutsideClick);
  }
}

// Function to close the menu if clicked outside
function closeMenuOutsideClick(event) {
  let menu = document.querySelector(".mobile-menu");
  let hamburger = document.querySelector(".hamburger");

  if (!menu.contains(event.target) && !hamburger.contains(event.target)) {
    menu.classList.remove("open");
    hamburger.classList.remove("open");
    menu.style.left = "-100%";
    document.removeEventListener("click", closeMenuOutsideClick);
  }
}

function toggleDropdown(event) {
  event.preventDefault();

  const dropdown = event.target.closest(".dropdown");
  const dropdownContent = dropdown.querySelector(".dropdown-content");

  // Hide all other dropdowns before showing the clicked one
  document
    .querySelectorAll(".mobile-menu .dropdown-content")
    .forEach((menu) => {
      if (menu !== dropdownContent) {
        menu.style.display = "none";
      }
    });

  // Toggle the visibility of the selected dropdown
  dropdownContent.style.display =
    dropdownContent.style.display === "block" ? "none" : "block";
}

// Show Password and Hide Password
const togglePassword = () => {
  const togglePassType = document.getElementById("password");
  const icon = document.getElementById("showPassword");
  if (togglePassType.type === "password") {
    togglePassType.type = "text";
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    togglePassType.type = "password";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
};

// Share Functionality
document.addEventListener("DOMContentLoaded", function () {
  const shareLinks = document.querySelectorAll(".share-link");

  shareLinks.forEach((link) => {
    link.addEventListener("click", function (event) {
      event.preventDefault(); // Prevent the default link behavior

      const platform = this.getAttribute("data-platform");
      const currentUrl = encodeURIComponent(window.location.href);
      const shareText = encodeURIComponent("Check out this blog post!");

      let shareUrl;

      switch (platform) {
        case "whatsapp":
          shareUrl = `https://api.whatsapp.com/send?text=${shareText}%20${currentUrl}`;
          break;
        case "facebook":
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`;
          break;
        case "twitter":
          shareUrl = `https://twitter.com/intent/tweet?url=${currentUrl}&text=${shareText}`;
          break;
        default:
          console.error("Unknown platform");
          return;
      }

      window.open(shareUrl, "_blank");
    });
  });
});

// Email Query (Footer)

document
  .getElementById("send-email-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent form from reloading the page

    const emailInput = this.querySelector('input[type="email"]').value;

    try {
      const response = await fetch("/query", {
        // Replace with your backend URL
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: emailInput }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Email sent successfully we will contact you soon!");
      } else {
        alert(`${data.message}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to send email.");
    }
  });
// Copy Button on Code Blocks
document.querySelectorAll("pre").forEach((pre) => {
  // Copy Button on Code Blocks
  document.querySelectorAll("pre").forEach((pre) => {
    let codeBlock = pre.querySelector("code"); // Check if <code> exists inside <pre>

    // Create a copy button
    let button = document.createElement("button");
    button.innerHTML = `<i class="fa-solid fa-copy"></i>`;
    button.classList.add("copy-btn");
    button.style.color = "#4361ee";

    button.addEventListener("mouseover", function () {
      button.style.color = "#2f1b13";
      button.textContent = "Copy Code";
      button.style.backgroundColor = "#fff";
    });

    button.addEventListener("mouseout", function () {
      button.style.color = "#4361ee";
      button.innerHTML = `<i class="fa-solid fa-copy"></i>`;
    });

    // Ensure <pre> has position relative for proper button placement
    pre.style.position = "relative";

    // Style the button to stay fixed inside the <pre>
    button.style.position = "absolute";
    button.style.top = "10px";
    button.style.right = "10px";
    button.style.background = "rgba(255, 255, 255, 0.8)";
    button.style.border = "none";
    button.style.padding = "5px 10px";
    button.style.cursor = "pointer";
    button.style.zIndex = "10";

    // Insert button inside <pre> but outside <code> to prevent copying its text
    pre.appendChild(button);

    // Copy function
    button.addEventListener("click", function () {
      let codeText = codeBlock
        ? codeBlock.textContent.trim()
        : pre.textContent.trim();

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(codeText)
          .then(() => {
            this.innerText = "Copied!";
            setTimeout(
              () => (this.innerHTML = `<i class="fa-solid fa-copy"></i>`),
              2000
            );
          })
          .catch((err) => {
            console.error("Clipboard API failed", err);
            fallbackCopyTextToClipboard(codeText); // Use fallback
          });
      } else {
        fallbackCopyTextToClipboard(codeText);
      }
    });
  });

  // Fallback for older mobile browsers
  function fallbackCopyTextToClipboard(text) {
    let textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);

    button.innerText = "Copied!";
    setTimeout(
      () => (button.innerHTML = `<i class="fa-solid fa-copy"></i>`),
      2000
    );
  }
});

document.querySelectorAll(".blog-content a").forEach((link) => {
  link.setAttribute("target", "_blank");
});
