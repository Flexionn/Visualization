
// Assuming you have an HTML element with id 'table-container' and 'date-range-slider'
const tableContainer = d3.select("#table-container");
const dateRangeSlider = d3.select("#date-range-slider");

// Load location data
d3.csv("data/location_ID.csv").then(function(locationData) {
    const locationToBorough = {};
    locationData.forEach(entry => {
        locationToBorough[entry.LocationID] = entry.Borough;
    });

    // Load trip data
    d3.csv("data/november_22.csv").then(function(tripData) {
        // Parse date strings to Date objects and filter dates for November 2022
        const novemberData = tripData.filter(d => {
            const pickupDate = new Date(d.tpep_pickup_datetime);
            return !isNaN(pickupDate.getTime()) && pickupDate.getFullYear() === 2022 && pickupDate.getMonth() === 10; // Month is 0-indexed
        });

        // Extract unique dates
        const uniqueDates = Array.from(new Set(novemberData.map(d => d.tpep_pickup_datetime.split(' ')[0])));
        const minDate = d3.min(uniqueDates);
        const maxDate = d3.max(uniqueDates);

        // Set default date range to cover the entire month
        const defaultStartDate = minDate;
        const defaultEndDate = maxDate;

        // Set up the date range slider
        dateRangeSlider.attr("min", minDate);
        dateRangeSlider.attr("max", maxDate);
        dateRangeSlider.attr("value", `${defaultStartDate},${defaultEndDate}`);
        dateRangeSlider.attr("step", 1);

        // Initialize table with the default date range
        updateTable(defaultStartDate, defaultEndDate);

        // Add event listener for slider input change
        dateRangeSlider.on("input", function() {
            const [startDate, endDate] = this.value.split(",");
            updateTable(startDate, endDate);
        });

        // Function to update the table based on the selected date range
        function updateTable(startDate, endDate) {
            const filteredData = novemberData.filter(d => {
                const pickupDate = new Date(d.tpep_pickup_datetime);
                return pickupDate >= new Date(startDate) && pickupDate <= new Date(endDate);
            });

            const boroughStats = {};
            filteredData.forEach(d => {
                const pickupBorough = locationToBorough[d.PULocationID];
                const dropoffBorough = locationToBorough[d.DOLocationID];

                if (pickupBorough) {
                    if (!boroughStats[pickupBorough]) {
                        boroughStats[pickupBorough] = { trips: 0, passengers: 0, trip_distance: 0, dropoffs: 0 };
                    }
                    boroughStats[pickupBorough].trips += 1;
                    boroughStats[pickupBorough].passengers += +d.passenger_count; // Ensure passenger_count is treated as a number
                    boroughStats[pickupBorough].trip_distance += +d.trip_distance; // Ensure trip_distance is treated as a number
                }

                if (dropoffBorough && dropoffBorough !== pickupBorough) {
                    if (!boroughStats[dropoffBorough]) {
                        boroughStats[dropoffBorough] = { trips: 0, passengers: 0, trip_distance: 0, dropoffs: 0 };
                    }
                    boroughStats[dropoffBorough].dropoffs += 1;
                }
            });

            // Convert boroughStats to an array for easier visualization
            const boroughArray = Object.entries(boroughStats).map(([borough, stats]) => ({ borough, ...stats }));

            // Remove existing table rows
            tableContainer.selectAll("table").remove();

            // Create a new table
            const table = tableContainer.append("table");
            const thead = table.append("thead");
            const tbody = table.append("tbody");

            // Add table headers
            thead
                .append("tr")
                .selectAll("th")
                .data(["Borough", "Trips", "Passengers", "Trip Distance", "Drop-offs"])
                .enter()
                .append("th")
                .text(d => d);

            // Add table rows
            const rows = tbody.selectAll("tr").data(boroughArray).enter().append("tr");

            // Add data to the table
            rows
                .selectAll("td")
                .data(d => [d.borough, d.trips, d.passengers, isNaN(d.trip_distance) ? "N/A" : d.trip_distance.toFixed(2), d.dropoffs])
                .enter()
                .append("td")
                .text(d => d);
        }
    });
});
