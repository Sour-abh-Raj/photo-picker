document.addEventListener("DOMContentLoaded", function () {
  const photoInput = document.getElementById("photo-input");
  const selectButton = document.getElementById("select-button");
  const loader = document.getElementById("loader");
  const photoBox = document.getElementById("photo-box");
  const editBox = document.getElementById("edit-box");
  const viewBox = document.getElementById("view-box");
  const finalImage = document.getElementById("final-image");
  const flipHorizontalButton = document.getElementById("flip-horizontal");
  const flipVerticalButton = document.getElementById("flip-vertical");
  const confirmButton = document.getElementById("confirm");
  const changePhotoButton = document.getElementById("change-photo");
  const removePhotoButton = document.getElementById("remove-photo");

  let croppieInstance = null;
  let flipHorizontal = false;
  let flipVertical = false;

  selectButton.addEventListener("click", () => photoInput.click());

  photoInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      loader.style.display = "block";
      const reader = new FileReader();
      reader.onload = function (e) {
        loader.style.display = "none";
        if (croppieInstance) {
          croppieInstance.destroy();
        }
        croppieInstance = new Croppie(
          document.getElementById("crop-container"),
          {
            viewport: { width: 200, height: 200, type: "square" },
            boundary: { width: 300, height: 300 },
            showZoomer: true,
            enableResize: true,
          }
        );
        croppieInstance.bind({
          url: e.target.result,
        });
        photoBox.style.transform = "translateX(-100%)";
        setTimeout(() => {
          photoBox.style.display = "none";
          editBox.style.display = "block";
          editBox.style.transform = "translateX(0)";
        }, 500);
      };
      reader.readAsDataURL(file);
    }
  });

  flipHorizontalButton.addEventListener("click", function () {
    flipHorizontal = !flipHorizontal;
    updateTransform();
  });

  flipVerticalButton.addEventListener("click", function () {
    flipVertical = !flipVertical;
    updateTransform();
  });

  function updateTransform() {
    const transform = `
        scale(${flipHorizontal ? -1 : 1}, ${flipVertical ? -1 : 1})
      `;
    document.querySelector(".cr-boundary").style.transform = transform;
  }

  confirmButton.addEventListener("click", function () {
    croppieInstance
      .result({
        type: "base64",
        format: "jpeg",
        size: "viewport",
        quality: 1,
      })
      .then((result) => {
        const img = new Image();
        img.onload = function () {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          canvas.width = img.width;
          canvas.height = img.height;

          // flips
          ctx.translate(
            flipHorizontal ? canvas.width : 0,
            flipVertical ? canvas.height : 0
          );
          ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);

          ctx.drawImage(img, 0, 0);

          finalImage.src = canvas.toDataURL("image/jpeg");

          // Scale the final image to fit the screen
          finalImage.style.maxWidth = "100%";
          finalImage.style.maxHeight = "100%";

          editBox.style.transform = "translateX(-100%)";
          setTimeout(() => {
            editBox.style.display = "none";
            viewBox.style.display = "block";
            viewBox.style.transform = "translateX(0)";
          }, 500);
        };
        img.src = result;
      });
  });

  changePhotoButton.addEventListener("click", function () {
    photoInput.value = ""; // Clear the input value to allow re-selecting the same file if needed
    photoInput.click();
  });

  removePhotoButton.addEventListener("click", function () {
    viewBox.style.transform = "translateX(-100%)";
    setTimeout(() => {
      viewBox.style.display = "none";
      photoBox.style.display = "block";
      photoBox.style.transform = "translateX(0)";
      finalImage.src = "";
      if (croppieInstance) {
        croppieInstance.destroy();
        croppieInstance = null;
      }
      photoInput.value = "";
    }, 500);
  });
});
