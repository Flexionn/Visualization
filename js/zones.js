// Load data from CSV
d3.csv("data/trip_count_60.csv").then(function(data) {
    // Extract unique dates for dropdown options
    var dates = [...new Set(data.map(d => d.pickup_date))];

    // Populate dropdown with dates
    var dropdown = d3.select("#date-dropdown");
    dropdown.selectAll("option")
        .data(dates)
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d);

    // Initial table render
    updateTable(data[0].pickup_date);

    // Event listener for dropdown change
    dropdown.on("change", function() {
        var selectedDate = this.value;
        updateTable(selectedDate);
    });

    // Function to update the table based on selected date
    function updateTable(selectedDate) {
        var filteredData = data.filter(d => d.pickup_date === selectedDate);

        // Aggregate data by PULocationZone and sum up amount
        var aggregatedData = d3.rollup(filteredData,
            v => d3.sum(v, d => d.amount),
            d => d.PULocationZone
        );

        // Convert aggregatedData to array of objects
        var aggregatedArray = Array.from(aggregatedData, ([key, value]) => ({ PULocationZone: key, amount: value }));

        // Remove existing rows
        d3.select("#data-table tbody").selectAll("tr").remove();

        // Append new rows based on aggregated data
        var rows = d3.select("#data-table tbody")
            .selectAll("tr")
            .data(aggregatedArray)
            .enter()
            .append("tr");

        // Append cells with data
        rows.append("td").text(d => d.PULocationZone);
        rows.append("td").text(d => d.amount);
    }
});
