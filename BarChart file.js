Promise.all([
    d3.csv("data/november_22.csv"),
    d3.csv("data/taxi_zones.csv")
])
    .then(function(data) {
        const taxiData = data[0];
        const taxiZoneData = data[1];

        // Process taxi data to aggregate counts for pick-ups per location
        const pickupCounts = {};
        taxiData.forEach(taxi => {
            pickupCounts[taxi.PULocationID] = (pickupCounts[taxi.PULocationID] || 0) + 1;
        });

        // Convert pickupCounts to an array of objects for easier sorting
        const pickupArray = Object.keys(pickupCounts).map(locationID => ({
            locationID: locationID,
            count: pickupCounts[locationID]
        }));

        // Sort the pickup locations by count in descending order
        const sortedPickups = pickupArray.sort((a, b) => b.count - a.count);

        // Extract top 10 most used pick-up locations
        const top10Pickups = sortedPickups.slice(0, 10);

        // Retrieve zones for the top 10 LocationIDs
        const top10Zones = taxiZoneData
            .filter(zone => top10Pickups.some(pickup => pickup.locationID === zone.LocationID))
            .reduce((acc, zone) => {
                acc[zone.LocationID] = zone.Zone;
                return acc;
            }, {});

        // Create a margin object for the SVG
        const margin = { top: 20, right: 30, bottom: 60, left: 60 };
        const width = 800 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        // Create SVG for the chart
        const svg = d3.select("#chart-container")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Create x-scale
        const xScale = d3.scaleBand()
            .domain(top10Pickups.map(d => d.locationID))
            .range([0, width])
            .padding(0.2);

        // Create y-scale with a linear scale
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(top10Pickups, d => d.count)])
            .range([height, 0]);

        // Create x-axis
        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        // Create y-axis
        svg.append("g")
            .call(d3.axisLeft(yScale));

        // Create bars for top 10 pick-up locations
        svg.selectAll("rect")
            .data(top10Pickups)
            .enter()
            .append("rect")
            .attr("x", d => xScale(d.locationID))
            .attr("y", d => yScale(d.count))
            .attr("width", xScale.bandwidth())
            .attr("height", d => height - yScale(d.count))
            .attr("fill", "steelblue");

        // Add labels for Zone under the bars (multiline)
        svg.selectAll(".labels")
            .data(top10Pickups)
            .enter()
            .append("text")
            .attr("x", d => xScale(d.locationID) + xScale.bandwidth() / 2)
            .attr("y", d => height + margin.top + 5) // Adjust vertical position for labels
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .selectAll("tspan")
            .data(d => top10Zones[d.locationID].split(" ").reverse().slice(1)) // Skip the first element (ID)
            .enter().append("tspan")
            .attr("x", d => xScale(d.locationID) + xScale.bandwidth() / 2)
            .attr("dy", "1em") // Set the line height
            .attr("dx", 0) // Adjust horizontal position as needed
            .text(d => d);
    })
    .catch(function(error) {
        console.error("Error loading the data: " + error);
    });
