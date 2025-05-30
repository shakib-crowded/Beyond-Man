document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const deleteButtons = document.querySelectorAll(".delete-btn");
  const deleteModal = document.getElementById("deleteModal");
  const cancelDelete = document.getElementById("cancelDelete");
  const confirmDelete = document.getElementById("confirmDelete");
  const closeModal = document.querySelector(".close-modal");

  // Current blog to be deleted
  let blogIdToDelete = null;

  // Initialize the page
  function init() {
    setupEventListeners();
  }

  // Set up all event listeners
  function setupEventListeners() {
    // Delete button handlers
    deleteButtons.forEach((btn) => {
      btn.addEventListener("click", function () {
        blogIdToDelete = this.getAttribute("data-id");
        showDeleteModal();
      });
    });

    // Modal handlers
    cancelDelete.addEventListener("click", hideDeleteModal);
    confirmDelete.addEventListener("click", handleDelete);
    closeModal.addEventListener("click", hideDeleteModal);
    deleteModal.addEventListener("click", function (e) {
      if (e.target === deleteModal) {
        hideDeleteModal();
      }
    });
  }

  // Show delete confirmation modal
  function showDeleteModal() {
    deleteModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  // Hide delete confirmation modal
  function hideDeleteModal() {
    deleteModal.classList.remove("active");
    document.body.style.overflow = "";
    blogIdToDelete = null;
  }

  // Handle blog deletion
  function handleDelete() {
    if (!blogIdToDelete) {
      hideDeleteModal();
      return;
    }

    // Show loading state
    confirmDelete.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Deleting...';
    confirmDelete.disabled = true;

    fetch(`/admin/delete/${blogIdToDelete}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          // Redirect to blog list after successful deletion
          window.location.href = "/admin/read?deleted=true";
        } else {
          throw new Error("Failed to delete blog");
        }
      })
      .catch((error) => {
        console.error("Error deleting blog:", error);
        alert("An error occurred while deleting the blog. Please try again.");
        confirmDelete.innerHTML = '<i class="fas fa-trash-alt"></i> Delete';
        confirmDelete.disabled = false;
      });
  }

  // Initialize the page
  init();
});

// Helper function to format dates (should be implemented in your backend)
function formatDateTime(dateString) {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
}
