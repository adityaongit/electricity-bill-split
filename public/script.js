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

// Date formatting helper function
function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
}

// Get month name from date
function getMonthName(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short" });
}

// Main Calculation Function
function calculateBill() {
    // Get bill information
    const totalBill =
        parseFloat(document.getElementById("total-bill").value) || 0;
    const totalUnitsBill =
        parseFloat(document.getElementById("total-units").value) || 0;
    const dateFrom = document.getElementById("date-from").value;
    const dateTo = document.getElementById("date-to").value;

    // Format date for display
    const formattedDateFrom = formatDate(dateFrom);
    const formattedDateTo = formatDate(dateTo);
    const billingPeriod =
        formattedDateFrom && formattedDateTo
            ? `${formattedDateFrom} to ${formattedDateTo}`
            : "Not specified";

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
    const submeterUnits = hallUnits + roomUnits;

    // Calculate common units (difference between bill total and submeter readings)
    const commonUnits = totalUnitsBill - submeterUnits;

    // Calculate per unit price
    const perUnitPrice = totalBill / totalUnitsBill;

    // Calculate costs
    const hallCost = hallUnits * perUnitPrice;
    const roomCost = roomUnits * perUnitPrice;
    const commonCost = commonUnits * perUnitPrice;

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

    // Calculate total person-days for common area cost distribution
    const totalPersonDays = hallTotalDays + roomTotalDays;

    // Calculate individual shares
    const distribution = [];

    // Calculate for hall flatmates
    hallFlatmates.forEach((flatmate) => {
        const areaShare = hallCost * (flatmate.days / hallTotalDays);
        const commonShare = commonCost * (flatmate.days / totalPersonDays);
        distribution.push({
            name: flatmate.name || "Unnamed",
            location: "Hall",
            days: flatmate.days,
            areaShare: ((flatmate.days / hallTotalDays) * 100).toFixed(2) + "%",
            areaAmount: areaShare.toFixed(2),
            commonAmount: commonShare.toFixed(2),
            totalAmount: (areaShare + commonShare).toFixed(2),
        });
    });

    // Calculate for room flatmates
    roomFlatmates.forEach((flatmate) => {
        const areaShare = roomCost * (flatmate.days / roomTotalDays);
        const commonShare = commonCost * (flatmate.days / totalPersonDays);
        distribution.push({
            name: flatmate.name || "Unnamed",
            location: "Room",
            days: flatmate.days,
            areaShare: ((flatmate.days / roomTotalDays) * 100).toFixed(2) + "%",
            areaAmount: areaShare.toFixed(2),
            commonAmount: commonShare.toFixed(2),
            totalAmount: (areaShare + commonShare).toFixed(2),
        });
    });

    // Display results
    displayResults({
        billingPeriod,
        dateFrom,
        dateTo,
        totalBill,
        totalUnitsBill,
        hallUnits,
        roomUnits,
        submeterUnits,
        commonUnits,
        perUnitPrice,
        hallCost,
        roomCost,
        commonCost,
        distribution,
    });
}

// Results Display Function
function displayResults(data) {
    document.getElementById("results").style.display = "block";

    // Display common units section with highlight if common units are significant
    const commonUnitsHighlight = data.commonUnits > 0 ? "highlight" : "";

    let summary = `
      <h3>Billing Period: ${data.billingPeriod}</h3>
      <div class="table-responsive">
        <table class="summary-table">
          <tbody>
            <tr>
              <th>Total Bill Amount</th>
              <td>₹${data.totalBill.toFixed(2)}</td>
              <th>Units Consumed (Bill)</th>
              <td>${data.totalUnitsBill.toFixed(2)}</td>
            </tr>
            <tr>
              <th>Per Unit Price</th>
              <td>₹${data.perUnitPrice.toFixed(2)}</td>
              <th>Submeter Units (Hall + Room)</th>
              <td>${data.submeterUnits.toFixed(2)}</td>
            </tr>
            <tr>
              <th>Hall Units</th>
              <td>${data.hallUnits.toFixed(2)}</td>
              <th>Room Units</th>
              <td>${data.roomUnits.toFixed(2)}</td>
            </tr>
            <tr>
              <th>Hall Cost</th>
              <td>₹${data.hallCost.toFixed(2)}</td>
              <th>Room Cost</th>
              <td>₹${data.roomCost.toFixed(2)}</td>
            </tr>
            <tr class="${commonUnitsHighlight}">
              <th>Common Units (Bill - Submeters)</th>
              <td>${data.commonUnits.toFixed(2)}</td>
              <th>Common Cost</th>
              <td>₹${data.commonCost.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
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
              <td>${item.areaShare}</td>
              <td>₹${item.areaAmount}</td>
              <td>₹${item.commonAmount}</td>
              <td><strong>₹${item.totalAmount}</strong></td>
          `;
        tbody.appendChild(row);
    });
}

// Download Results as Image Function
function downloadResults() {
    const resultsDiv = document.getElementById("results");
    const dateFrom = document.getElementById("date-from").value;
    const dateTo = document.getElementById("date-to").value;

    // Generate filename with month info if available
    let filename = "electricity-bill";
    if (dateFrom && dateTo) {
        const fromMonth = getMonthName(dateFrom);
        const toMonth = getMonthName(dateTo);
        filename = `electricity-bill-${fromMonth.toLowerCase()}-${toMonth.toLowerCase()}`;
    } else {
        filename = `electricity-bill-${new Date().toISOString().slice(0, 10)}`;
    }

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

    const clearSavedBtn = clone.querySelector(".clearSaved-btn");
    if (clearSavedBtn) {
        clearSavedBtn.remove();
    }

    const resultsHeader = clone.querySelector(".section-title");
    if (resultsHeader) {
        resultsHeader.remove();
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
            link.download = `${filename}.png`;
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
        dateFrom: document.getElementById("date-from").value,
        dateTo: document.getElementById("date-to").value,
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

    document.getElementById("date-from").value = data.dateFrom || "";
    document.getElementById("date-to").value = data.dateTo || "";
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
