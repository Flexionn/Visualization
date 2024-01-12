// Load the CSV data and create the table
d3.csv('data/daily_stats.csv').then(function(data) {
    // Parse the date in the CSV file
    data.forEach(function(d) {
        d.date = new Date(d.date);
    });

    // Filter the data for the initial date
    var initialDate = new Date('2022-11-01');
    var filteredData = data.filter(function(d) {
        return d.date.toDateString() === initialDate.toDateString() && d.Borough !== 'Unknown';
    });

    // Create the initial table
    createTable(filteredData);

    // Function to update the table based on the selected date range
    window.updateTable = function() {
        // Get the selected date from the slider
        var selectedDate = new Date(document.getElementById('dateRange').value);

        // Filter the data based on the selected date
        var filteredData = data.filter(function(d) {
            return d.date.toDateString() === selectedDate.toDateString();
        });

        // Update the table with the filtered data
        createTable(filteredData);
    };
});

// Function to create the table
// Function to create the table
function createTable(data) {
    // Select the table container
    var tableContainer = d3.select('#tableContainer');

    // Remove existing table content
    tableContainer.html('');

    // Create the table
    var table = tableContainer.append('table');

    // Create the table header
    var thead = table.append('thead');
    thead.append('tr')
        .selectAll('th')
        .data(['Borough', 'Total Trips', 'Total Passengers', 'Median Distance', 'Median Fare Amount'])
        .enter()
        .append('th')
        .text(function(d) { return d; });

    // Create the table body
    var tbody = table.append('tbody');
    var rows = tbody.selectAll('tr')
        .data(data)
        .enter()
        .append('tr');

    // Populate the table cells
    var cells = rows.selectAll('td')
        .data(function(d) {
            // Format numbers with two decimal places
            var formattedData = [
                d.Borough,
                Math.round(d.total_trips),
                Math.round(d.total_passengers * 100) / 100,  // Two decimal places
                Math.round(d.median_distance * 100) / 100,    // Two decimal places
                Math.round(d.median_fare_amount * 100) / 100   // Two decimal places
            ];
            return formattedData;
        })
        .enter()
        .append('td')
        .text(function(d) { return d; });
}

