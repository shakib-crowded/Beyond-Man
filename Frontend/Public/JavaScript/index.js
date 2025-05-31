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
  console.log(event);
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
  console.log("Logout Button");
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

// Comment Section JavaScript

document.addEventListener("DOMContentLoaded", function () {
  // Get form element
  // const commentForm = document.getElementById("commentForm");

  // Function to handle comment submission
  async function submitComment(event) {
    event.preventDefault(); // Prevent page reload

    const content = document.getElementById("commentInput").value.trim();
    const blogId = document.getElementById("blogIdInput").value;
    const blogAuthor = document.getElementById("authorUsernameInput").value;

    if (!content) {
      alert("Comment cannot be empty.");
      return;
    }

    try {
      const response = await fetch("/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, blogId }),
      });

      const data = await response.json();

      if (response.status === 401) {
        document.cookie = `pendingAction=${JSON.stringify({
          action: "comment",
          content,
          blogAuthor,
          blogId,
        })}; path=/; max-age=300`;

        const model = document.getElementById("unautherized");
        model.classList.remove("hidden");
        model.style.backgroundColor = "#f44336";
        model.style.color = "#fff";
        model.style.top = "30%";
        model.style.display = "block";

        setTimeout(() => {
          model.style.display = "none";
          window.location.href = "/login";
        }, 3000);
      }

      if (response.ok) {
        // Clear the textarea
        document.getElementById("commentInput").value = "";
        location.reload();
        // Append new comment to the UI
        addCommentToUI(data.comment);
      } else if (response.status !== 401) {
        alert(data.error || "Failed to add comment.");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  }
  // Function to dynamically add the new comment to the page
  function addCommentToUI(comment) {
    const commentsSection = document.getElementById("commentsList");

    const commentElement = document.createElement("div");
    commentElement.classList.add("comment");
    commentElement.innerHTML = `
          <div class="comment-header">
              <div class="left-section">
                  <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_kSSoomJ9hiFXmiF2RdZlwx72Y23XsT6iwQ&s"
                      alt="User Avatar" class="avatar">
                  <div class="user-info">
                      <b class="username">You</b>
                      <span class="timestamp">${
                        new Date(comment.created_at).toISOString().split("T")[0]
                      }</span>
                  </div>
              </div>
              <div class="right-section">
                  <button class="edit-btn" onclick="editComment('${
                    comment._id
                  }')"> <i class="fa-solid fa-pen"></i>Edit </button>
                  <button class="delete-btn" onclick="showDeleteModal('${
                    comment._id
                  }', 'comment')"><i class="fa-solid fa-trash"></i> Delete</button>
              </div>
          </div>
          <p id="comment-content-${comment._id}" class="comment-content">${
      comment.content
    }</p>
      `;

    commentsSection.prepend(commentElement); // Add comment to the top
  }

  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
  const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
  const commentForm = document.getElementById("commentForm"); // Ensure this ID exists

  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", confirmDelete);
  }

  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener("click", hideDeleteModal);
  }

  if (commentForm) {
    commentForm.addEventListener("submit", submitComment);
  }
});

const likeComment = async (commentId) => {
  try {
    const response = await fetch(`/comments/${commentId}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (response.status === 401) {
      // Store the pending like action and blog details in a cookie
      const blogAuthor = document.getElementById("authorUsernameInput").value; // Hidden input for author username
      const blogId = document.getElementById("blogIdInput").value; // Hidden input for blog ID
      document.cookie = `pendingAction=${JSON.stringify({
        action: "like",
        commentId,
        blogAuthor,
        blogId,
      })}; path=/; max-age=300`;

      const model = document.getElementById("unautherized");
      model.classList.remove("hidden");
      model.style.backgroundColor = "#f44336";
      model.style.color = "#fff";
      model.style.top = "30%";
      model.style.display = "block";

      setTimeout(() => {
        model.style.display = "none";
        window.location.href = "/login";
      }, 3000);
    }

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();

    // Update like/dislike counts dynamically
    document.getElementById(`likes-${commentId}`).innerText = data.likes;
    document.getElementById(`dislikes-${commentId}`).innerText = data.dislikes;

    // Toggle button colors
    const likeBtn = document.getElementById(`like-btn-${commentId}`);
    const dislikeBtn = document.getElementById(`dislike-btn-${commentId}`);

    if (data.userLiked) {
      likeBtn.classList.add("liked");
      dislikeBtn.classList.remove("disliked");
    } else {
      likeBtn.classList.remove("liked");
    }
  } catch (error) {
    console.error("Error liking comment:", error);
  }
};

const dislikeComment = async (commentId) => {
  try {
    const response = await fetch(`/comments/${commentId}/dislike`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (response.status === 401) {
      // Store the pending dislike action and blog details in a cookie
      const blogAuthor = document.getElementById("authorUsernameInput").value; // Hidden input for author username
      const blogId = document.getElementById("blogIdInput").value; // Hidden input for blog ID
      document.cookie = `pendingAction=${JSON.stringify({
        action: "dislike",
        commentId,
        blogAuthor,
        blogId,
      })}; path=/; max-age=300`;

      const model = document.getElementById("unautherized");
      model.classList.remove("hidden");
      model.style.backgroundColor = "#f44336";
      model.style.color = "#fff";
      model.style.top = "30%";
      model.style.display = "block";

      setTimeout(() => {
        model.style.display = "none";
        window.location.href = "/login";
      }, 3000);
    }

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();

    // Update like/dislike counts dynamically
    document.getElementById(`likes-${commentId}`).innerText = data.likes;
    document.getElementById(`dislikes-${commentId}`).innerText = data.dislikes;

    // Toggle button colors
    const likeBtn = document.getElementById(`like-btn-${commentId}`);
    const dislikeBtn = document.getElementById(`dislike-btn-${commentId}`);

    if (data.userDisliked) {
      dislikeBtn.classList.add("disliked");
      likeBtn.classList.remove("liked");
    } else {
      dislikeBtn.classList.remove("disliked");
    }
  } catch (error) {
    console.error("Error disliking comment:", error);
  }
};

const toggleReplyBox = (commentId) => {
  const replyBox = document.getElementById(`replyBox-${commentId}`);
  const toggleButton = document.querySelector(
    `button[onclick="toggleReplyBox('${commentId}')"]`
  );

  if (!replyBox || !toggleButton) {
    console.error(`Reply box not found for ID: replyBox-${commentId}`);
    return; // Stop execution if replyBox is not found
  }

  if (replyBox.style.display === "none") {
    replyBox.style.display = "block";
    toggleButton.innerHTML = '<i class="fa-solid fa-xmark"></i> Close ';
  } else {
    replyBox.style.display = "none";
    toggleButton.innerHTML = '<i class="fa-solid fa-reply"></i> Reply';
  }

  // replyBox.style.display = replyBox.style.display === "none" ? "block" : "none";
};

const toggleReplies = (commentId) => {
  const repliesList = document.getElementById(`replies-${commentId}`);
  const toggleButton = document.querySelector(
    `button[onclick="toggleReplies('${commentId}')"]`
  );

  if (!repliesList || !toggleButton) {
    console.error(`Replies list not found for ID: replies-${commentId}`);
    return;
  }

  if (repliesList.classList.contains("hidden")) {
    repliesList.classList.remove("hidden");
    toggleButton.innerHTML = `<i class="fa-solid fa-folder-closed"></i> Close Replies`;
  } else {
    toggleButton.innerHTML = `<i class="fa-solid fa-folder-open"></i> Show Replies (${repliesList.children.length})`;
    repliesList.classList.add("hidden");
  }
};

const postReply = async (commentId) => {
  const replyContent = document.getElementById(`replyInput-${commentId}`).value;

  if (!replyContent.trim()) {
    alert("Reply cannot be empty!");
    return;
  }

  try {
    const response = await fetch(`/comments/${commentId}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: replyContent }),
    });

    if (response.status === 401) {
      // Store the pending reply action and blog details in a cookie
      const blogAuthor = document.getElementById("authorUsernameInput").value; // Hidden input for author username
      const blogId = document.getElementById("blogIdInput").value; // Hidden input for blog ID
      document.cookie = `pendingAction=${JSON.stringify({
        action: "reply",
        commentId,
        replyContent,
        blogAuthor,
        blogId,
      })}; path=/; max-age=300`;

      const model = document.getElementById("unautherized");
      model.classList.remove("hidden");
      model.style.backgroundColor = "#f44336";
      model.style.color = "#fff";
      model.style.top = "30%";
      model.style.display = "block";

      setTimeout(() => {
        model.style.display = "none";
        window.location.href = "/login";
      }, 3000);
    }

    if (response.ok) {
      location.reload(); // Reload page to show reply
    } else if (response.status !== 401) {
      const data = await response.json();
      alert(data.error || "Failed to post reply");
    }
  } catch (error) {
    console.error("Error posting reply:", error);
  }
};
function editComment(commentId) {
  let commentContent = document.getElementById(`comment-content-${commentId}`);
  let editBox = document.getElementById(`editCommentBox-${commentId}`);
  let editInput = document.getElementById(`editCommentInput-${commentId}`);

  if (!editBox) {
    return alert("Refresh Before Edit The Comment.");
  }

  // Show the edit box & hide the original comment content
  commentContent.style.display = "none";
  editBox.classList.remove("hidden");
  editInput.focus();
}

// Function to save edited comment
function saveEditedComment(commentId) {
  let editInput = document.getElementById(`editCommentInput-${commentId}`);
  let newContent = editInput.value.trim();

  if (newContent === "") return alert("Comment cannot be empty!");

  fetch(`/comments/${commentId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: newContent }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Update UI
        document.getElementById(`comment-content-${commentId}`).innerText =
          newContent;
        cancelEditComment(commentId); // Hide edit box
      } else {
        alert("Failed to edit comment.");
      }
    });
}

// Function to cancel editing and restore original view
function cancelEditComment(commentId) {
  let commentContent = document.getElementById(`comment-content-${commentId}`);
  let editBox = document.getElementById(`editCommentBox-${commentId}`);

  commentContent.style.display = "block";
  editBox.classList.add("hidden");
}

// Function to delete a comment
function deleteComment(commentId) {
  if (confirm("Are you sure you want to delete this comment?")) {
    fetch(`/comments/${commentId}`, { method: "DELETE" })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          document
            .getElementById(`comment-content-${commentId}`)
            .parentElement.remove();
        } else {
          alert("Failed to delete comment.");
        }
      });
  }
}

const editReply = (commentId, replyId, currentContent) => {
  // Hide normal content and show edit box
  document.getElementById(`reply-content-${replyId}`).classList.add("hidden");
  document.getElementById(`editReplyBox-${replyId}`).classList.remove("hidden");
};

const saveEditedReply = async (commentId, replyId) => {
  const editedContent = document.getElementById(
    `editReplyInput-${replyId}`
  ).value;

  if (!editedContent.trim()) {
    alert("Reply content cannot be empty!");
    return;
  }

  try {
    const response = await fetch(`/comments/${commentId}/${replyId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editedContent }),
    });

    if (response.ok) {
      document.getElementById(`reply-content-${replyId}`).innerText =
        editedContent;
      cancelEditReply(replyId);
    } else {
      alert("Failed to update reply.");
    }
  } catch (error) {
    console.error("Error updating reply:", error);
  }
};

const cancelEditReply = (replyId) => {
  document
    .getElementById(`reply-content-${replyId}`)
    .classList.remove("hidden");
  document.getElementById(`editReplyBox-${replyId}`).classList.add("hidden");
};

const deleteReply = async (commentId, replyId) => {
  if (!confirm("Are you sure you want to delete this reply?")) return;

  try {
    const response = await fetch(`/comments/${commentId}/${replyId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      document
        .getElementById(`reply-content-${replyId}`)
        .parentElement.remove();
    } else {
      alert("Failed to delete reply.");
    }
  } catch (error) {
    console.error("Error deleting reply:", error);
  }
};
let deleteItemId = null;
let deleteType = null; // "comment" or "reply"
let parentCommentId = null; // Needed for replies

// Function to show the delete confirmation modal
function showDeleteModal(itemId, type, parentId = null) {
  deleteItemId = itemId;
  deleteType = type;
  parentCommentId = parentId; // Store parent comment ID for replies

  const modal = document.getElementById("deleteConfirmModal");
  modal.classList.remove("hidden");
  modal.style.display = "block"; // Ensure modal is visible
}

// // Attach event listeners
// document
//   .getElementById("confirmDeleteBtn")
//   .addEventListener("click", confirmDelete);
// document
//   .getElementById("cancelDeleteBtn")
//   .addEventListener("click", hideDeleteModal);

// Function to hide the modal
function hideDeleteModal() {
  const modal = document.getElementById("deleteConfirmModal");
  modal.classList.add("hidden");
  modal.style.display = "none"; // Hide modal properly
  deleteItemId = null;
  deleteType = null;
  parentCommentId = null;
}

// Function to delete the comment or reply
async function confirmDelete() {
  if (!deleteItemId || !deleteType) return;

  let url =
    deleteType === "comment"
      ? `/comments/${deleteItemId}`
      : `/comments/${parentCommentId}/${deleteItemId}`;

  try {
    const response = await fetch(url, { method: "DELETE" });

    if (response.ok) {
      document
        .getElementById(`${deleteType}-content-${deleteItemId}`)
        .parentElement.remove();
      hideDeleteModal();
    } else {
      alert("Failed to delete.");
    }
  } catch (error) {
    console.error("Error deleting:", error);
  }
}

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
