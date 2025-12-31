function updateTitleCharCount() {
  const titleInput = document.getElementById("title");
  const charTitleCount = document.getElementById("charTitleCount");
  charTitleCount.textContent = `${titleInput.value.length}/200 characters`;
}
function updateDescriptionCharCount() {
  const descriptionInput = document.getElementById("description");
  const charDescriptionCount = document.getElementById("charDescriptionCount");
  charDescriptionCount.textContent = `${descriptionInput.value.length}/200 characters`;
}

let blogIdToDelete = null;

function showDeleteCard(blogId) {
  blogIdToDelete = blogId; // Store the blog ID
  document.getElementById("deleteCard").style.display = "block";
  document.getElementById("overlay").style.display = "block";
}

function hideDeleteCard() {
  blogIdToDelete = null; // Reset the blog ID
  document.getElementById("deleteCard").style.display = "none";
  document.getElementById("overlay").style.display = "none";
}

// Cancel button hides the confirmation card
document
  .getElementById("cancelButton")
  .addEventListener("click", hideDeleteCard);

// Confirm delete button sends an asynchronous DELETE request
document.getElementById("confirmDeleteButton").addEventListener("click", () => {
  if (blogIdToDelete) {
    fetch(`/admin/delete/${blogIdToDelete}?_method=DELETE`, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else if (response.status === 403) {
          // Handle unauthorized error
          return response.json().then((data) => {
            throw new Error(data.error);
          });
        } else {
          throw new Error("You Are Not Admin Of This Blog.");
        }
      })
      .then((data) => {
        alert(data.message);
        hideDeleteCard();
        const blogElement = document.getElementById(`blog-${blogIdToDelete}`);
        if (blogElement) {
          blogElement.remove();
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert(error.message || "An error occurred while deleting the blog.");
      });
  }
});
