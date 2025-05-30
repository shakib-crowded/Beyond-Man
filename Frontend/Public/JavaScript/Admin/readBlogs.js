document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const blogGrid = document.querySelector(".blog-grid");
  const blogSearch = document.getElementById("blogSearch");
  const sortBy = document.getElementById("sortBy");
  const modal = document.getElementById("confirmationModal");
  const modalCancel = document.getElementById("modalCancel");
  const modalConfirm = document.getElementById("modalConfirm");

  // Current blog to be deleted
  let currentBlogId = null;

  // Initialize the page
  function init() {
    setupEventListeners();
  }

  // Set up all event listeners
  function setupEventListeners() {
    // Search functionality
    blogSearch.addEventListener("input", debounce(filterBlogs, 300));

    // Sort functionality
    sortBy.addEventListener("change", sortBlogs);

    // Delete button handlers
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        currentBlogId = this.getAttribute("data-id");
        showConfirmationModal(
          "Delete Blog",
          "Are you sure you want to delete this blog? This action cannot be undone.",
          deleteBlog
        );
      });
    });

    // Modal handlers
    modalCancel.addEventListener("click", hideConfirmationModal);
    modal.addEventListener("click", function (e) {
      if (e.target === modal) {
        hideConfirmationModal();
      }
    });
  }

  // Filter blogs based on search input
  function filterBlogs() {
    const searchTerm = blogSearch.value.toLowerCase();
    const blogCards = document.querySelectorAll(".blog-card");

    blogCards.forEach((card) => {
      const title = card.querySelector(".blog-title").textContent.toLowerCase();
      const description = card
        .querySelector(".blog-description")
        .textContent.toLowerCase();
      const category = card
        .querySelector(".category")
        .textContent.toLowerCase();

      if (
        title.includes(searchTerm) ||
        description.includes(searchTerm) ||
        category.includes(searchTerm)
      ) {
        card.style.display = "flex";
      } else {
        card.style.display = "none";
      }
    });
  }

  // Sort blogs based on selected option
  function sortBlogs() {
    const sortValue = sortBy.value;
    const blogGrid = document.querySelector(".blog-grid");
    const blogCards = Array.from(document.querySelectorAll(".blog-card"));

    blogCards.sort((a, b) => {
      switch (sortValue) {
        case "newest":
          return (
            new Date(b.getAttribute("data-date")) -
            new Date(a.getAttribute("data-date"))
          );
        case "oldest":
          return (
            new Date(a.getAttribute("data-date")) -
            new Date(b.getAttribute("data-date"))
          );
        case "title-asc":
          return a
            .querySelector(".blog-title")
            .textContent.localeCompare(
              b.querySelector(".blog-title").textContent
            );
        case "title-desc":
          return b
            .querySelector(".blog-title")
            .textContent.localeCompare(
              a.querySelector(".blog-title").textContent
            );
        default:
          return 0;
      }
    });

    // Re-append sorted cards
    blogCards.forEach((card) => blogGrid.appendChild(card));
  }

  // Show confirmation modal
  function showConfirmationModal(title, message, confirmCallback) {
    document.getElementById("modalTitle").textContent = title;
    document.getElementById("modalMessage").textContent = message;

    // Remove previous event listener
    modalConfirm.replaceWith(modalConfirm.cloneNode(true));
    const newConfirmBtn = document.getElementById("modalConfirm");

    // Add new event listener
    newConfirmBtn.addEventListener("click", function () {
      confirmCallback();
      hideConfirmationModal();
    });

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  // Hide confirmation modal
  function hideConfirmationModal() {
    modal.classList.remove("active");
    document.body.style.overflow = "";
    currentBlogId = null;
  }

  // Delete blog function
  function deleteBlog() {
    if (!currentBlogId) return;

    fetch(`/admin/delete/${currentBlogId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          // Remove the blog card from the UI
          const blogCard = document.querySelector(
            `.blog-card[data-id="${currentBlogId}"]`
          );
          if (blogCard) {
            blogCard.remove();

            // Show empty state if no blogs left
            if (document.querySelectorAll(".blog-card").length === 0) {
              showEmptyState();
            }
          }
        } else {
          alert("Failed to delete blog. Please try again.");
        }
      })
      .catch((error) => {
        console.error("Error deleting blog:", error);
        alert("An error occurred while deleting the blog.");
      });
  }

  // Show empty state
  function showEmptyState() {
    const emptyStateHTML = `
            <div class="empty-state">
                <i class="fas fa-book-open"></i>
                <h3>No Blogs Available</h3>
                <p>You haven't created any blogs yet. Get started by clicking the "New Blog" button.</p>
                <a href="/admin/edit" class="btn btn-primary">Create Your First Blog</a>
            </div>
        `;
    blogGrid.innerHTML = emptyStateHTML;
  }

  // Confirm logout
  function confirmLogout() {
    showConfirmationModal(
      "Confirm Logout",
      "Are you sure you want to log out?",
      () => {
        window.location.href = "/admin/logout";
      }
    );
  }

  // Debounce function for search input
  function debounce(func, wait) {
    let timeout;
    return function () {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func.apply(context, args);
      }, wait);
    };
  }

  // Initialize the page
  init();
});
