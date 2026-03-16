// popup.js
document.addEventListener("DOMContentLoaded", () => {
    const scrollTimerInput = document.getElementById("scrollTimer");
    const successMessage = document.getElementById("successMessage");
    const increaseButton = document.getElementById("increaseButton");
    const decreaseButton = document.getElementById("decreaseButton");
    const showButtonsCheckbox = document.getElementById("showButtons");

    // Load the current scroll timer value from storage
    chrome.storage.local.get(["scrollTimer", "showButtons"], (data) => {
      scrollTimerInput.value = data.scrollTimer || 3; // Default to 3 seconds if no value is set
      showButtonsCheckbox.checked = data.showButtons !== false; // Default to true if no value is set
    });

    // Save the scroll timer value to storage
    function saveScrollTimer(newTimerValue) {
      chrome.storage.local.set({ scrollTimer: newTimerValue }, () => {
        // Show success message
        successMessage.style.display = "block";
        // Hide success message after 2 seconds
        setTimeout(() => {
          successMessage.style.display = "none";
        }, 2000);
      });
    }

    // Save the checkbox state to storage
    showButtonsCheckbox.addEventListener("change", (e) => {
      const showButtons = e.target.checked;
      chrome.storage.local.set({ showButtons }, () => {
        // Update the UI or perform actions if needed when checkbox is toggled
      });
    });

    // Increase scroll timer when the "+" button is clicked
    increaseButton.addEventListener("click", () => {
      let currentValue = parseInt(scrollTimerInput.value, 10) || 3;
      currentValue++;
      scrollTimerInput.value = currentValue;
      saveScrollTimer(currentValue);
    });

    // Decrease scroll timer when the "-" button is clicked
    decreaseButton.addEventListener("click", () => {
      let currentValue = parseInt(scrollTimerInput.value, 10) || 3;
      if (currentValue > 1) {
        currentValue--;
        scrollTimerInput.value = currentValue;
        saveScrollTimer(currentValue);
      }
    });
});
