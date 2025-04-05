// Flatmate Management Functions
function addFlatmate(area) {
    const container = document.getElementById(area + "-flatmates");
    const flatmateDiv = document.createElement("div");
    flatmateDiv.className = "flatmate";
  
    flatmateDiv.innerHTML = `
          <div class="form-group">
              <label>Name</label>
              <input type="text" class="${area}-name" placeholder="Flatmate name">
          </div>
          <div class="form-group">
              <label>Days Stayed</label>
              <input type="number" class="${area}-days" min="0" max="31" value="30">
          </div>
      `;
  
    container.appendChild(flatmateDiv);
  }
  
  function removeFlatmate(area) {
    const container = document.getElementById(area + "-flatmates");
    if (container.children.length > 1) {
      container.removeChild(container.lastChild);
    }
  }
  
  // Data Collection Functions
  function getFlatmatesInfo(area) {
    const container = document.getElementById(area + "-flatmates");
    const names = container.querySelectorAll(`.${area}-name`);
    const days = container.querySelectorAll(`.${area}-days`);
  
    const flatmates = [];
    for (let i = 0; i < names.length; i++) {
      flatmates.push({
        name: names[i].value,
        days: parseInt(days[i].value) || 0,
      });
    }
  
    return flatmates;
  }
  
  // Main Calculation Function
  function calculateBill() {
    // Get bill information
    const totalBill =
      parseFloat(document.getElementById("total-bill").value) || 0;
    const totalUnitsBill =
      parseFloat(document.getElementById("total-units").value) || 0;
    const billingPeriod = document.getElementById("billing-period").value;
  
    // Get submeter readings
    const hallPrevious =
      parseFloat(document.getElementById("hall-previous").value) || 0;
    const hallCurrent =
      parseFloat(document.getElementById("hall-current").value) || 0;
    const roomPrevious =
      parseFloat(document.getElementById("room-previous").value) || 0;
    const roomCurrent =
      parseFloat(document.getElementById("room-current").value) || 0;
  
    // Calculate units consumed
    const hallUnits = hallCurrent - hallPrevious;
    const roomUnits = roomCurrent - roomPrevious;
    const totalUnitsCalculated = hallUnits + roomUnits;
  
    // Verify if total units match the bill
    const unitsMatch = Math.abs(totalUnitsCalculated - totalUnitsBill) < 0.01;
  
    // Calculate per unit price
    const perUnitPrice = totalBill / totalUnitsCalculated;
  
    // Calculate cost for hall and room
    const hallCost = hallUnits * perUnitPrice;
    const roomCost = roomUnits * perUnitPrice;
  
    // Get flatmates information
    const hallFlatmates = getFlatmatesInfo("hall");
    const roomFlatmates = getFlatmatesInfo("room");
  
    // Calculate total person-days for each area
    const hallTotalDays = hallFlatmates.reduce(
      (sum, flatmate) => sum + flatmate.days,
      0
    );
    const roomTotalDays = roomFlatmates.reduce(
      (sum, flatmate) => sum + flatmate.days,
      0
    );
  
    // Calculate individual shares
    const distribution = [];
  
    // Calculate for hall flatmates
    hallFlatmates.forEach((flatmate) => {
      const share = hallCost * (flatmate.days / hallTotalDays);
      distribution.push({
        name: flatmate.name || "Unnamed",
        location: "Hall",
        days: flatmate.days,
        share: ((flatmate.days / hallTotalDays) * 100).toFixed(2) + "%",
        amount: share.toFixed(2),
      });
    });
  
    // Calculate for room flatmates
    roomFlatmates.forEach((flatmate) => {
      const share = roomCost * (flatmate.days / roomTotalDays);
      distribution.push({
        name: flatmate.name || "Unnamed",
        location: "Room",
        days: flatmate.days,
        share: ((flatmate.days / roomTotalDays) * 100).toFixed(2) + "%",
        amount: share.toFixed(2),
      });
    });
  
    // Display results
    displayResults({
      billingPeriod,
      totalBill,
      totalUnitsBill,
      totalUnitsCalculated,
      unitsMatch,
      hallUnits,
      roomUnits,
      perUnitPrice,
      hallCost,
      roomCost,
      distribution,
    });
  }
  
  // Results Display Function
  function displayResults(data) {
    document.getElementById("results").style.display = "block";
  
    // Display calculation summary
    let summary = `
          <h3>Billing Period: ${data.billingPeriod || "Not specified"}</h3>
          <p><strong>Total Bill Amount:</strong> ₹${data.totalBill.toFixed(2)}</p>
          <p><strong>Units Consumed (Bill):</strong> ${data.totalUnitsBill.toFixed(
            2
          )}</p>
          <p><strong>Units Calculated (Submeters):</strong> ${data.totalUnitsCalculated.toFixed(
            2
          )} 
             ${data.unitsMatch ? "✓ (matches bill)" : "✗ (discrepancy)"}</p>
          <p><strong>Hall Units:</strong> ${data.hallUnits.toFixed(2)}</p>
          <p><strong>Room Units:</strong> ${data.roomUnits.toFixed(2)}</p>
          <p><strong>Per Unit Price:</strong> ₹${data.perUnitPrice.toFixed(2)}</p>
          <p><strong>Hall Cost:</strong> ₹${data.hallCost.toFixed(2)}</p>
          <p><strong>Room Cost:</strong> ₹${data.roomCost.toFixed(2)}</p>
      `;
  
    document.getElementById("calculation-summary").innerHTML = summary;
  
    // Display bill distribution
    const tbody = document.getElementById("distribution-body");
    tbody.innerHTML = "";
  
    data.distribution.forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = `
              <td>${item.name}</td>
              <td>${item.location}</td>
              <td>${item.days}</td>
              <td>${item.share}</td>
              <td>₹${item.amount}</td>
          `;
      tbody.appendChild(row);
    });
  }
  
  // Download Results as Image Function
  function downloadResults() {
    const resultsDiv = document.getElementById("results");
  
    // Create a clean clone of the results section for screenshot
    const clone = resultsDiv.cloneNode(true);
    clone.style.display = "block";
    clone.style.position = "absolute";
    clone.style.left = "-9999px";
    clone.style.background = "#fff";
    clone.style.padding = "20px";
    clone.style.width = "780px"; // Fixed width for consistency
  
    // Remove the download button from the clone
    const downloadBtn = clone.querySelector(".download-btn");
    if (downloadBtn) {
      downloadBtn.remove();
    }
  
    document.body.appendChild(clone);
  
    // Use html2canvas to create an image
    html2canvas(clone, {
      backgroundColor: "#fff",
      scale: 2, // Higher resolution
      logging: false,
      useCORS: true,
    })
      .then(function (canvas) {
        // Create download link
        const link = document.createElement("a");
        link.download =
          "electricity-bill-" + new Date().toISOString().slice(0, 10) + ".png";
        link.href = canvas.toDataURL("image/png");
        link.click();
  
        // Clean up
        document.body.removeChild(clone);
      })
      .catch(function (error) {
        console.error("Error generating image:", error);
        alert("Could not generate image. Please try again.");
        document.body.removeChild(clone);
      });
  }
  
  document.addEventListener("input", saveFormData);
  
  function saveFormData() {
    const data = {
      billingPeriod: document.getElementById("billing-period").value,
      totalBill: document.getElementById("total-bill").value,
      totalUnits: document.getElementById("total-units").value,
      hallPrevious: document.getElementById("hall-previous").value,
      hallCurrent: document.getElementById("hall-current").value,
      roomPrevious: document.getElementById("room-previous").value,
      roomCurrent: document.getElementById("room-current").value,
      hallFlatmates: getFlatmatesInfo("hall"),
      roomFlatmates: getFlatmatesInfo("room"),
    };
  
    localStorage.setItem("billSplitterData", JSON.stringify(data));
  }
  
  window.addEventListener("load", loadFormData);
  
  function loadFormData() {
    const data = JSON.parse(localStorage.getItem("billSplitterData"));
    if (!data) return;
  
    document.getElementById("billing-period").value = data.billingPeriod || "";
    document.getElementById("total-bill").value = data.totalBill || "";
    document.getElementById("total-units").value = data.totalUnits || "";
    document.getElementById("hall-previous").value = data.hallPrevious || "";
    document.getElementById("hall-current").value = data.hallCurrent || "";
    document.getElementById("room-previous").value = data.roomPrevious || "";
    document.getElementById("room-current").value = data.roomCurrent || "";
  
    // Load hall flatmates
    const hallContainer = document.getElementById("hall-flatmates");
    hallContainer.innerHTML = "";
    data.hallFlatmates.forEach((flatmate) => {
      addFlatmate("hall");
      const last = hallContainer.lastElementChild;
      last.querySelector(".hall-name").value = flatmate.name;
      last.querySelector(".hall-days").value = flatmate.days;
    });
  
    // Load room flatmates
    const roomContainer = document.getElementById("room-flatmates");
    roomContainer.innerHTML = "";
    data.roomFlatmates.forEach((flatmate) => {
      addFlatmate("room");
      const last = roomContainer.lastElementChild;
      last.querySelector(".room-name").value = flatmate.name;
      last.querySelector(".room-days").value = flatmate.days;
    });
  }
  