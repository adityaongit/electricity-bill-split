# Electricity Bill Splitter

A web application that helps roommates and flatmates fairly split electricity bills based on submeter readings and days stayed.

## 🔌 Features

- **Submeter-Based Calculations**: Split bills based on actual electricity consumption in different areas of your home
- **Time-Adjusted Distribution**: Account for varying durations of stay for each flatmate
- **Multiple Zones Support**: Handle different areas (Hall and Room) with separate submeters
- **Detailed Results**: View clear breakdown of individual costs and common area charges
- **Downloadable Summaries**: Save calculation results for sharing with roommates
- **Data Persistence**: Locally saved data for convenience (with option to clear)
- **Mobile-Friendly Interface**: Works on all device sizes


### Usage

1. Enter your electricity bill details:
   - Billing period (from/to dates)
   - Total bill amount
   - Total units consumed

2. Input submeter readings:
   - Previous and current readings for Hall submeter
   - Previous and current readings for Room submeter

3. Add flatmates for each area:
   - Names of each person
   - Number of days stayed during the billing period

4. Click "Calculate Bill Distribution" to view results

5. Download the summary or clear saved data as needed


## 🧮 How the Bill is Calculated

1. **Submeter Consumption**:
   - Hall consumption = Hall current reading - Hall previous reading
   - Room consumption = Room current reading - Room previous reading

2. **Common Area Consumption**:
   - Common = Total units - (Hall consumption + Room consumption)

3. **Per-Person Distribution**:
   - Each person's share is calculated based on:
     - Their location (Hall or Room)
     - Days stayed during the billing period
     - Consumption in their area
     - Equal share of common area consumption

4. **Final Amount**:
   - Direct consumption cost based on unit rate
   - Share of common area cost
   - Total = Direct cost + Common area share

## 🛠️ Technology Stack

- HTML5
- CSS3
- JavaScript (Vanilla)
- LocalStorage for data persistence
- html2canvas for generating downloadable summaries

## 📐 Project Structure

```
/
├── index.html           # Main HTML file
├── styles.css           # CSS styles
├── script.js            # JavaScript functionality
├── public/              # Static assets
│   └── favicons/        # Favicon files for various platforms
└── README.md            # Project documentation
```