document.addEventListener("DOMContentLoaded", function () {
  // Logout modal elements
  const logoutModal = document.getElementById("logoutModal");
  const overlay = document.getElementById("overlay");
  const cancelButton = document.getElementById("cancelButton");
  const logoutButton = document.getElementById("logoutButton");

  // Hide logout confirmation
  function hideLogOutCard() {
    logoutModal.classList.remove("active");
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  // Event listeners
  overlay.addEventListener("click", hideLogOutCard);
  cancelButton.addEventListener("click", hideLogOutCard);

  // Logout functionality - replace with your actual logout logic
  logoutButton.addEventListener("click", function () {
    // Here you would typically:
    // 1. Send a request to your server to invalidate the session
    // 2. Redirect to the login page or home page

    // Example:
    fetch("/logout", {
      method: "POST",
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
          window.location.href = "/admin/login";
        } else {
          alert("Logout failed. Please try again.");
        }
      })
      .catch((error) => {
        console.error("Logout error:", error);
        alert("An error occurred during logout.");
      });
  });

  // Add keyboard accessibility
  document.addEventListener("keydown", function (e) {
    if (logoutModal.classList.contains("active")) {
      if (e.key === "Escape") {
        hideLogOutCard();
      }

      // Trap focus within modal when open
      if (e.key === "Tab") {
        const focusableElements = logoutModal.querySelectorAll("button");
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    }
  });

  // Set initial focus to cancel button when modal opens
  document.addEventListener("showLogOutCard", function () {
    cancelButton.focus();
  });
});

// Show logout confirmation
function showLogOutCard() {
  logoutModal.classList.add("active");
  overlay.classList.add("active");
  document.body.style.overflow = "hidden";
}
