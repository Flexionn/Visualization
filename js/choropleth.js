    // The svg
    const svg = d3.select("#my_dataviz"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

    // Map and projection for NYC
    const projection = d3.geoMercator()
    .center([-74.0060, 40.7128]) // Center on NYC
    .scale(45000) // Adjust scale for NYC zoom level
    .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Data and color scale
    const taxiData = new Map(); // Will be filled with the number of taxi trips per zone
    const colorScale = d3.scaleThreshold()
    .domain([1, 10, 50, 100, 500, 1000]) // Adjust based on your data range
    .range(d3.schemeReds[7]); // Red color scheme for taxi trips

    const uniqueDays = new Set();
    const uniqueHours = new Set();

    // Function to process CSV data
    function processTaxiData(data) {
    data.forEach(d => {
        let day = d.Day;
        let hour = d.Hour;

        uniqueDays.add(day);
        uniqueHours.add(hour);

        const key = `${d.LocationID}-${day}-${hour}`;
        taxiData.set(key, +d.Count);
        console.log(`Set taxiData[${key}] = ${d.Count}`); // Log setting data
    });
}

    function populateDropdowns(days, hours) {
    const daySelect = document.getElementById('daySelect');
    const hourSelect = document.getElementById('hourSelect');

    days.forEach(day => {
    let option = document.createElement('option');
    option.value = day;
    option.text = day;
    daySelect.appendChild(option);
});

    hours.forEach(hour => {
    let option = document.createElement('option');
    option.value = hour;
    option.text = hour;
    hourSelect.appendChild(option);
});
    console.log("Days populated: ", Array.from(days));
    console.log("Hours populated: ", Array.from(hours));
}

    // Load external data for NYC taxi zones and taxi trip counts
    Promise.all([
    fetch("data/NYC-Taxi-Zones.geojson").then(response => {
    if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
}
    return response.json();
}), // Replace with the path to your NYC taxi zones GeoJSON
    fetch("data/tripcount_calculated.csv").then(response => {
    if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
}
    return response.text();
}) // Replace with the path to your taxi data CSV
    ]).then(function(loadData){
    let nycZones = loadData[0];
    let taxiCSV = d3.csvParse(loadData[1]); // Parse CSV text

    console.log('NYC Taxi Zones:', nycZones); // Log the loaded GeoJSON data
    console.log('Taxi Trip Counts (parsed CSV):', taxiCSV); // Log the parsed CSV data


    processTaxiData(taxiCSV); // Process CSV data

    populateDropdowns(uniqueDays, uniqueHours); // Populate dropdowns after processing data

        let maxTripCount = 0;
        taxiData.forEach(value => {
            maxTripCount = Math.max(maxTripCount, value);
        });

        const newDomain = [1, 10, 50, 100, 500, 1000, maxTripCount / 2, maxTripCount]; // Adjust the thresholds as needed
        colorScale.domain(newDomain);




        const daySelect = document.getElementById('daySelect');
    const hourSelect = document.getElementById('hourSelect');

    // Event listener for day selection
    daySelect.addEventListener('change', function() {
        if (this.value === "all") {
            console.log("All days selected");
            updateMap("all", hourSelect.value);
        }
        else {
            console.log(`Day selected: ${this.value}`);
            updateMap(this.value, hourSelect.value);

        }
});

    // Event listener for hour selection
    hourSelect.addEventListener('change', function() {
    if (this.value === "all") {
    console.log("All Hours selected");
    updateMap(daySelect.value, "all"); // Pass "all" to indicate all hours
} else {
    console.log(`Hour selected: ${this.value}`);
    updateMap(daySelect.value, this.value);
}
});

    let mouseOver = function(event, d) {
        const day = daySelect.value; // Get the selected day
        const hour = hourSelect.value; // Get the selected hour
        let tripCount = 0;

        if (day === "all" && hour === "all") {
            // Sum trip counts for all days and all hours
            uniqueDays.forEach(currentDay => {
                uniqueHours.forEach(currentHour => {
                    const key = `${d.properties.location_id}-${currentDay}-${currentHour}`;
                    tripCount += taxiData.get(key) || 0;
                });
            });
        } else if (day === "all") {
            // Sum trip counts for all days in the specific hour
            uniqueDays.forEach(currentDay => {
                const key = `${d.properties.location_id}-${currentDay}-${hour}`;
                tripCount += taxiData.get(key) || 0;
            });
        } else if (hour === "all") {
            // Sum trip counts for all hours in the specific day
            uniqueHours.forEach(currentHour => {
                const key = `${d.properties.location_id}-${day}-${currentHour}`;
                tripCount += taxiData.get(key) || 0;
            });
        } else {
            // Get the trip count for the specific day and hour
            const key = `${d.properties.location_id}-${day}-${hour}`;
            tripCount = taxiData.get(key) || 0;
        }

        d3.selectAll(".Zone")
            .transition()
            .duration(200)
            .style("opacity", .5);
        d3.select(this)
            .transition()
            .duration(200)
            .style("opacity", 1);
        d3.select("#tooltip")
            .html(`Zone: ${d.properties.zone}<br>Borough: ${d.properties.borough}<br>Trip Count: ${tripCount}`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY + 10) + "px")
            .style("opacity", 1);
    }

    let mouseLeave = function(event, d) {
    d3.selectAll(".Zone")
    .transition()
    .duration(200)
    .style("opacity", .8);
    d3.select(this)
    .transition()
    .duration(200);
    d3.select("#tooltip")
    .style("opacity", 0);
}



    // Function to update the map based on the selected day and hour
        function updateMap(day, hour) {
            console.log(`Updating map for day: ${day}, hour: ${hour}`);
            svg.selectAll(".Zone")
                .transition()
                .duration(200)
                .attr("fill", function(d) {
                    let totalTripCount = 0;

                    if (day === "all") {
                        // Handle "All Days" option by summing trip counts for all days and the selected hour (or all hours)
                        uniqueDays.forEach((currentDay) => {
                            if (hour === "all") {
                                // Sum trip counts for all hours in the currentDay
                                uniqueHours.forEach((currentHour) => {
                                    const key = `${d.properties.location_id}-${currentDay}-${currentHour}`;
                                    totalTripCount += taxiData.get(key) || 0;
                                });
                            } else {
                                // Get the trip count for the specific hour in the currentDay
                                const key = `${d.properties.location_id}-${currentDay}-${hour}`;
                                totalTripCount += taxiData.get(key) || 0;
                            }
                        });
                    } else if (hour === "all") {
                        // Handle "All Hours" option by summing trip counts for all hours in the selected day
                        uniqueHours.forEach((currentHour) => {
                            const key = `${d.properties.location_id}-${day}-${currentHour}`;
                            totalTripCount += taxiData.get(key) || 0;
                        });
                    } else {
                        // Get the trip count for the specific day and hour
                        const key = `${d.properties.location_id}-${day}-${hour}`;
                        totalTripCount = taxiData.get(key) || 0;
                    }

                    return colorScale(totalTripCount); // Color based on total trip count
                });
        }


    // Create dropdowns for day and hour selection
    // This would be actual HTML elements and event listeners for change events



    // Initial map drawing
    svg.append("g")
    .selectAll("path")
    .data(nycZones.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("class", "Zone")
    .style("stroke", "black") // Set stroke color for borders
    .style("stroke-width", "1px") // Set stroke width for borders
    .style("opacity", .8)
    .attr("fill", function (d) {
    // Set initial fill based on default day and hour (e.g., 0, 0)
    const key = `${d.properties.location_id}-0-0`;
    const tripCount = taxiData.get(key) || 0;
    return colorScale(tripCount);
})
    .on("mouseover", mouseOver)
    .on("mouseleave", mouseLeave);

    // ... (existing code)

    // After your existing code where you append the zones to the SVG
    // Add a legend to the SVG

    const legendWidth = 300;
    const legendHeight = 20;
    const numLegendColors = colorScale.range().length;
    const legendX = (width - legendWidth) / 2; // Center the legend horizontally
    const legendY = height - 50; // Set legend position Y


        const legendScale = d3.scaleLinear()
            .domain([0, maxTripCount])
            .range([0, legendWidth]);

        const legendAxis = d3.axisBottom(legendScale)
            .tickSize(13)
            .tickValues(colorScale.domain()) // Set the tick values exactly to the colorScale domain
            .tickFormat(d => d3.format(".2s")(d)); // Format the ticks, for example, using SI prefix


// Draw the legend
        const legend = svg.append("g")
            .attr("id", "legend")
            .attr("transform", `translate(${legendX}, ${legendY})`);

// Add colored rectangles to the legend
        legend.selectAll("rect")
            .data(colorScale.range())
            .enter()
            .append("rect")
            .attr("x", (d, i) => i * legendWidth / numLegendColors)
            .attr("y", 0)
            .attr("width", legendWidth / numLegendColors)
            .attr("height", legendHeight)
            .style("fill", d => d);

// Add text labels to the legend
        legend.append("g")
            .attr("transform", `translate(0, ${legendHeight})`)
            .call(legendAxis);



    // Initially update the map for the default day and hour
    updateMap(1, 17); // Replace with default or current day and hour
})
    .catch(error => {
    console.error('Error loading or processing data:', error);
});
