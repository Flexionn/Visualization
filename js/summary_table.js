// Parse the data
const data = {
    "Toatal Number of Trips": 3252717,
    "Median Trip Distance": "1.89 miles",
    "Total Amount": "71.825.260,62 US$",
    "Median Tip Rate": "19.93 %",
    "Median Trip Duration": "13.02 min"
};

// Select the container div
const container = d3.select("#chart-container");

// Append a table to the container
const table = container.append("table");

// Append rows to the table
Object.entries(data).forEach(([key, value]) => {
    const row = table.append("tr");
    row.append("th").text(key);
    row.append("td").text(value);
});