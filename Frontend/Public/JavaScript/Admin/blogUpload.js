document.addEventListener("DOMContentLoaded", function () {
  // Initialize Quill Editor
  const initializeEditor = () => {
    // Register modules
    if (typeof Quill !== "undefined" && typeof ImageResize !== "undefined") {
      Quill.register("modules/imageResize", ImageResize.default || ImageResize);

      // Create the editor
      window.quill = new Quill("#editor", {
        modules: {
          syntax: {
            highlight: (text) => hljs.highlightAuto(text).value,
          },
          toolbar: {
            container: "#toolbar-container",
            handlers: {
              image: handleImageUpload,
            },
          },
          imageResize: {
            displaySize: true,
            modules: ["Resize", "DisplaySize"],
          },
        },
        placeholder: "Write your blog content here...",
        theme: "snow",
      });

      // ⬇️ Load saved content from localStorage (if any)
      const savedContent = localStorage.getItem("draft-content");
      if (savedContent) {
        quill.root.innerHTML = savedContent;
      }

      // ⬇️ Update hidden input and save content to localStorage on change
      const contentInput = document.getElementById("content");
      quill.on("text-change", () => {
        const html = quill.root.innerHTML;
        contentInput.value = html;
        localStorage.setItem("draft-content", html); // Auto-save here
      });
    } else {
      console.error("Required libraries not loaded");
    }
  };

  // Handle image uploads
  const handleImageUpload = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = () => {
      const file = input.files[0];
      if (!file) return;

      if (!file.type.match("image.*")) {
        alert("Please select an image file");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        openImageCropper(e.target.result);
      };
      reader.readAsDataURL(file);
    };
  };

  // Open image cropper modal
  const openImageCropper = (imageSrc) => {
    const modal = document.getElementById("cropperModal");
    const cropperImage = document.getElementById("cropperImage");

    cropperImage.src = imageSrc;
    modal.classList.add("active");
    document.body.style.overflow = "hidden";

    // Initialize cropper
    const cropper = new Cropper(cropperImage, {
      aspectRatio: 16 / 9,
      viewMode: 1,
      autoCropArea: 0.8,
      responsive: true,
      guides: true,
    });

    let alignment = "align-left";

    // Set up alignment buttons
    document.querySelectorAll(".align-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        alignment = `align-${btn.dataset.align}`;

        // Update active state
        document.querySelectorAll(".align-btn").forEach((b) => {
          b.classList.remove("active");
        });
        btn.classList.add("active");
      });
    });

    // Cancel button
    document.getElementById("cancelCrop").addEventListener("click", () => {
      cropper.destroy();
      modal.classList.remove("active");
      document.body.style.overflow = "";
    });

    // Insert button
    document.getElementById("insertImage").addEventListener("click", () => {
      const canvas = cropper.getCroppedCanvas();
      if (canvas) {
        const range = quill.getSelection();
        quill.clipboard.dangerouslyPasteHTML(
          range.index,
          `<img src="${canvas.toDataURL(
            "image/jpeg",
            0.9
          )}" class="${alignment}" />`
        );
      }

      cropper.destroy();
      modal.classList.remove("active");
      document.body.style.overflow = "";
    });
  };

  // Character counters
  const setupCharacterCounters = () => {
    const updateCounter = (inputId, counterId, maxLength) => {
      const input = document.getElementById(inputId);
      const counter = document.getElementById(counterId);

      input.addEventListener("input", () => {
        const length = input.value.length;
        counter.textContent = `${length}/${maxLength} characters`;

        if (length > maxLength * 0.9) {
          counter.style.color = "var(--danger-color)";
        } else {
          counter.style.color = "var(--gray-color)";
        }
      });
    };

    updateCounter("title", "charTitleCount", 250);
    updateCounter("description", "charDescriptionCount", 120);
    updateCounter("author", "charAuthorCount", 40);
  };

  // Image preview
  const setupImagePreview = () => {
    const imageInput = document.getElementById("image-url");
    const imagePreview = document.getElementById("imagePreview");

    imageInput.addEventListener("change", () => {
      const file = imageInput.files[0];
      if (!file) return;

      if (!file.type.match("image.*")) {
        alert("Please select an image file");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
      };
      reader.readAsDataURL(file);
    });
  };

  // Form validation
  const setupFormValidation = () => {
    const form = document.getElementById("blogForm");

    form.addEventListener("submit", (e) => {
      const content = document.getElementById("content").value;
      const image = document.getElementById("image-url").files[0];

      if (!content || content.trim().length < 50) {
        e.preventDefault();
        alert(
          "Please provide meaningful blog content (at least 50 characters)"
        );
        return;
      }

      if (!image) {
        e.preventDefault();
        alert("Please upload a featured image for your blog");
        return;
      }
      // Clear localStorage only if form is actually valid and submitting
      localStorage.removeItem("draft-content");
    });
  };

  // Preview functionality
  const setupPreview = () => {
    document.getElementById("previewBtn").addEventListener("click", () => {
      // In a real implementation, this would open a preview window
      // or show a preview modal with the formatted content
      alert("Preview functionality would show your formatted blog here");
    });
  };

  const form = document.getElementById("blogForm");
  if (form) {
    form.addEventListener("submit", function () {
      localStorage.removeItem("draft-content");
    });
  }

  // Initialize all components
  initializeEditor();
  setupCharacterCounters();
  setupImagePreview();
  setupFormValidation();
  setupPreview();
});
