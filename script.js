$(document).ready(function () {
  let isFullscreen = false; // Flag to track if the page is in full-screen mode
  $("#gridSize").empty().append('<option value="">Select Size</option>');
  bindGridGroupDropdown();

  // Function to fetch the JSON file and read the data
  async function fetchJsonData() {
    try {
      const response = await fetch("script/data.json"); // Replace 'data.json' with your actual file path
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching JSON data:", error);
      return [];
    }
  }

  $("#gridForm").submit(function (e) {
    e.preventDefault(); // Prevent the form from submitting

    const cellCount = parseInt($("#gridSize").val());

    if (!cellCount || isNaN(cellCount)) {
      alert("Please select all dropdowns before proceeding.");
      return;
    }

    // Request full-screen mode for the document
    const docEl = document.documentElement;
    if (docEl.requestFullscreen) {
      docEl.requestFullscreen();
    } else if (docEl.mozRequestFullScreen) {
      // For Firefox
      docEl.mozRequestFullScreen();
    } else if (docEl.webkitRequestFullscreen) {
      // For Chrome, Safari, and Opera
      docEl.webkitRequestFullscreen();
    } else if (docEl.msRequestFullscreen) {
      // For IE/Edge
      docEl.msRequestFullscreen();
    }

    // Hide the dropdown-container
    $(".dropdown-container").hide();

    // Make the grid-container-wrapper full screen
    $(".grid-container-wrapper").css("width", "100%");

    // Mark the page as full-screen
    isFullscreen = true;

    // Create the grid with the selected number of cells
    createGrid(cellCount);
  });

  // Create Grid
  async function createGrid(cellCount) {
    const $gridContainer = $("#gridContainer");
    $gridContainer.empty(); // Clear existing grid

    // Fetch the data from the JSON file
    const cellData = await fetchJsonData();

    // Ensure the cell count does not exceed 50
    cellCount = Math.min(cellCount, 50);

    // Dynamically calculate grid layout based on the selected cell count
    const columns = Math.min(cellCount, 5); // Max 5 columns per row
    const rows = Math.ceil(cellCount / columns); // Calculate number of rows

    // Dynamically set the grid layout
    const gridTemplateColumns = `repeat(${columns}, 1fr)`; // Flexibility in columns
    $gridContainer.css("gridTemplateColumns", gridTemplateColumns);

    // Calculate dynamic cell height based on the number of rows
    const screenHeight = $(window).height();
    const cellHeight = (screenHeight - 100) / rows; // Subtracting 100 for padding and header

    // Generate cells based on the selected number
    for (let i = 0; i < cellCount; i++) {
      const cellInfo = cellData[i]; // Get corresponding data for this cell
      const $cell = $("<div>")
        .addClass("grid-item")
        .css("height", `${cellHeight}px`);

      $cell.text(cellInfo.Name); // Cell content

      // Apply color based on status
      switch (cellInfo.Status) {
        case "Healthy":
          $cell.css("backgroundColor", "green");
          break;
        case "Unhealthy":
          $cell.css("backgroundColor", "red");
          break;
        case "Error":
          $cell.css("backgroundColor", "gray");

          const $errorMessageContainer = $("<div>").addClass(
            "error-message-container"
          );
          const errorMessages = cellInfo.Error.split(","); // Assuming error messages are comma-separated

          errorMessages.forEach((msg, index) => {
            const $errorMessage = $("<div>")
              .addClass("error-message")
              .text(msg.trim())
              .css("animationDelay", `${index * 12}s`); // Add staggered animation delay

            $errorMessageContainer.append($errorMessage);
          });
          $cell.append($errorMessageContainer);
          break;
      }

      // Add click event for beep sound and blinking effect (only if fullscreen)
      $cell.click(function () {
        if (!isFullscreen) return; // Prevent click functionality if not in full-screen mode

        // Check if the cell is not already blinking
        if (!$(this).hasClass("blink")) {
          // Play beep sound when the cell starts blinking
          const beepSound = new Audio("script/beep-sound.mp3"); // Replace with your beep sound file
          beepSound.play();

          // Start blinking
          $(this).addClass("blink");
        } else {
          // Stop blinking if the cell is already blinking
          $(this).removeClass("blink");
        }
      });

      $gridContainer.append($cell);
    }
  }

  // Event listeners
  $("#gridSize").change(function () {
    const cellCount = parseInt($(this).val());
    createGrid(cellCount); // Create grid with the selected number of cells
  });

  $("#gridGroup").change(function () {
    const selectedGroup = parseInt($(this).val());
    updateGridScreenDropdown(selectedGroup);
  });

  $("#gridScreen").change(function () {
    const selectedGroup = parseInt($("#gridGroup").val());
    const selectedScreen = parseInt($(this).val());
    updateGridSizeDropdown(selectedGroup, selectedScreen);
  });

  // Bind Grid Group Dropdown
  async function bindGridGroupDropdown() {
    const $gridGroupSelect = $("#gridGroup");
    const data = await fetchJsonData(); // Fetch data from the JSON file

    // Calculate the number of groups based on data length divided by 150 (items per group)
    const totalGroups = Math.ceil(data.length / 150);

    // Generate group numbers dynamically
    const groups = Array.from({ length: totalGroups }, (_, i) =>
      (i + 1).toString()
    );

    // Clear existing options and add "Select Option" default option
    $gridGroupSelect.empty().append('<option value="">Select Group</option>');

    // Add options for each group dynamically
    groups.forEach((group) => {
      $gridGroupSelect.append(`<option value="${group}">${group}</option>`);
    });

    // Optionally set the first group as selected (default selection)
    if (groups.length > 0) {
      $gridGroupSelect.val("1").trigger("change"); // Ensure default is "Select Group"
    }
  }

  // Update Grid Screen Dropdown based on selected group
  async function updateGridScreenDropdown(selectedGroup) {
    const $gridScreenSelect = $("#gridScreen");
    const data = await fetchJsonData(); // Fetch data from the JSON file

    // Calculate start and end indices for the selected group
    const startIndex = (selectedGroup - 1) * 150; // Each group has 150 items
    const endIndex = Math.min(selectedGroup * 150, data.length); // Ensure we don't exceed the data length

    // Count of items in the selected group
    const groupDataCount = endIndex - startIndex;

    // Calculate the number of screens based on group data count divided by 50 (items per screen)
    const totalScreens = Math.ceil(groupDataCount / 50); // Each screen can have 50 items

    // Generate screen numbers dynamically
    const screens = Array.from({ length: totalScreens }, (_, i) =>
      (i + 1).toString()
    );

    // Clear existing options and add "Select Option" default option
    $gridScreenSelect.empty().append('<option value="">Select Screen</option>');

    // Add options for each screen dynamically
    screens.forEach((screen) => {
      $gridScreenSelect.append(`<option value="${screen}">${screen}</option>`);
    });

    // Optionally set the first screen as selected (default selection)
    if (screens.length > 0) {
      $gridScreenSelect.val("1").trigger("change"); // Ensure default is "Select Screen"
    }
  }
  // Update Grid Size Dropdown based on selected group and screen
  async function updateGridSizeDropdown(selectedGroup, selectedScreen) {
    const $gridSizeSelect = $("#gridSize");
    const data = await fetchJsonData(); // Fetch data from the JSON file

    // Calculate start and end indices for the selected group
    const startIndex = (selectedGroup - 1) * 150; // Each group has 150 items
    const endIndex = Math.min(selectedGroup * 150, data.length); // Ensure we don't exceed the data length

    // Calculate data specific to the selected screen
    const groupData = data.slice(startIndex, endIndex);
    const screenStartIndex = (selectedScreen - 1) * 50; // Each screen has 50 items
    const screenEndIndex = Math.min(selectedScreen * 50, groupData.length); // Ensure we don't exceed the screen data length

    // Count of items in the selected screen
    const screenDataCount = screenEndIndex - screenStartIndex;

    // Clear the existing options in the dropdown
    $gridSizeSelect.empty();

    // Add the default "Select Option" first
    $gridSizeSelect.append('<option value="">Select Option</option>');

    // Add options for grid sizes dynamically
    for (let i = 1; i <= screenDataCount; i++) {
      if (i % 2 === 0) {
        // Only add even numbers for grid size
        $gridSizeSelect.append(`<option value="${i}">1 - ${i}</option>`);
      }
    }

    // Optionally set the first option as selected (default selection)
    if ($gridSizeSelect.children().length > 1) {
      // Check if options other than "Select Option" exist
      $gridSizeSelect.val("50").trigger("change"); // Ensure default is "Select Size"
    }
  }
});
