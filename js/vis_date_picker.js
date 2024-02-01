// Load data from CSV
Promise.all([d3.csv("data/trip_count_60.csv"), d3.csv("data/trip_count_60.csv"), d3.csv("data/daily_stats.csv")])
    .then(function(dataArray) {
        const [data1, data2, data3] = dataArray;

        // Initialize date dropdown
        const dates = Array.from(new Set(data1.map(d => d.pickup_date)));
        const dateDropdown = d3.select("#date-filter");
        dateDropdown.selectAll("option")
            .data(dates)
            .enter()
            .append("option")
            .text(d => d)
            .attr("value", d => d);

        // Event listener for date dropdown change
        dateDropdown.on("change", function () {
            const selectedDate = this.value;
            updateVisualizations(selectedDate);
        });

        // Initial update of both visualizations with the first date
        updateVisualizations(dates[0]);

        function updateVisualizations(selectedDate) {
            updateVisualization1(data1, selectedDate);
            updateVisualization2(data2, selectedDate);
            updateVisualization3(data3, selectedDate);
        }

        function updateVisualization1(data, selectedDate) {
            // Visualization 1 code using 'data' and 'selectedDate'
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

            filteredData.sort((a, b) => b.amount - a.amount);

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

        function updateVisualization2(data, selectedDate) {
            // Visualization 2 code using 'data' and 'selectedDate'
            const filteredData = data.filter(d => d.pickup_date === selectedDate);

            // Remove existing SVG elements before updating
            d3.select("#visualization-container").select("svg").remove();

            // Your existing visualization code here
            const width = 928;
            const height = 900;
            const types = Array.from(new Set(filteredData.map(d => d.amount)));
            const nodes = Array.from(new Set(filteredData.flatMap(l => [l.PULocationID, l.DOLocationID])))
                .map(id => ({
                    id,
                    zone: filteredData.find(d => d.PULocationID === id)?.PULocationZone || filteredData.find(d => d.DOLocationID === id)?.DOLocationZone || "Unknown Zone"
                }));

            const links = filteredData.map(d => ({
                source: nodes.find(node => node.id === d.PULocationID),
                target: nodes.find(node => node.id === d.DOLocationID),
                amount: d.amount,
            }));


            const color = d3.scaleSequential(d3.interpolateReds);

            const simulation = d3.forceSimulation(nodes)
                .force("link", d3.forceLink(links).id(d => d.id))
                .force("charge", d3.forceManyBody().strength(-1500))
                .force("x", d3.forceX())
                .force("y", d3.forceY());

            const svg = d3.create("svg")
                .attr("viewBox", [-width / 2, -height / 2, width, height])
                .attr("width", width)
                .attr("height", height)
                .attr("style", "max-width: 100%; height: auto; font: 12px sans-serif;");

            const container = d3.select("#visualization-container");
            container.append(() => svg.node());

            const markerSizeScale = d3.scaleLinear()
                .domain([d3.min(data, d => d.amount), d3.max(data, d => d.amount)])
                .range([4.48, 4.5]);

            // Per-type markers, as they don't inherit styles.
            svg.append("defs").selectAll("marker")
                .data(types)
                .join("marker")
                .attr("id", d => `arrow-${d}`)
                .attr("viewBox", "0 -5 10 10")
                .attr("refX", 15)
                .attr("refY", -0.5)
                .attr("markerWidth", d => markerSizeScale(d)) // Use the scale for marker width
                .attr("markerHeight", d => markerSizeScale(d))
                .attr("orient", "auto")
                .append("path")
                .attr("fill", color)
                .attr("d", "M0,-5L10,0L0,5");

            // Create a linear scale for stroke width
            const strokeWidthScale = d3.scaleLinear()
                .domain([d3.min(data, d => d.amount), d3.max(data, d => d.amount)])
                .range([0.5, 3.5]); // Adjust the range for the desired thickness range


            const linkGroup = svg.append("g")
                .attr("fill", "none")
                .selectAll("path")
                .data(links)
                .join("path")
                .attr("stroke", d => color(d.amount))
                .attr("stroke-width", d => strokeWidthScale(d.amount))
                .attr("marker-end", d => `url(#arrow-${d.amount})`)
                .attr("markerWidth", d => markerSizeScale(d.amount)) // Set markerWidth using the scale
                .attr("markerHeight", d => markerSizeScale(d.amount));



            const textGroup = svg.append("g")
                .selectAll("text")
                .data(links)
                .join("text")
                .attr("class", "link-label")
                .text(d => d.amount)
                .attr("fill", "black")
                .style("font-size", "10px")
                .style("pointer-events", "none")
                .style("visibility", "hidden");


            const node = svg.append("g")
                .attr("fill", "currentColor")
                .attr("stroke-linecap", "round")
                .attr("stroke-linejoin", "round")
                .selectAll("g")
                .data(nodes)
                .join("g")
                .call(drag(simulation));

            node.append("circle")
                .attr("stroke", "white")
                .attr("stroke-width", 1.5)
                .attr("r", 4);

            node.append("text")
                .attr("x", 8)
                .attr("y", "0.31em")
                .text(d => d.zone)
                .clone(true).lower()
                .attr("fill", "none")
                .attr("stroke", "white")
                .attr("stroke-width", 3);

            linkGroup
                .on("mouseover", function (event, d) {
                    d3.select(this).selectAll(".link-label").style("visibility", "visible");
                })
                .on("mouseout", function (event, d) {
                    d3.select(this).selectAll(".link-label").style("visibility", "hidden");
                });


            simulation.on("tick", () => {
                linkGroup.attr("d", linkArc);
                textGroup.attr("transform", d => `translate(${(d.source.x + d.target.x) / 2},${(d.source.y + d.target.y) / 2})`);
                node.attr("transform", d => `translate(${d.x},${d.y})`);
            });
        }

    });

function updateVisualization3 (data, selectedDate){
    var filteredData = data.filter(d => d.date === selectedDate);

    // Remove existing rows
    d3.select("#data-table-2 tbody").selectAll("tr").remove();

    filteredData.sort((a, b) => b.total_trips - a.total_trips);

    // Append new rows based on filtered data
    var rows = d3.select("#data-table-2 tbody")
        .selectAll("tr")
        .data(filteredData)
        .enter()
        .append("tr");

    // Append cells with data
    rows.append("td").text(d => d.Borough);
    rows.append("td").text(d => d.total_trips);
    rows.append("td").text(d => d.total_passengers);
}


function linkArc(d) {
    const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
    return `
    M${d.source.x},${d.source.y}
    A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
  `;
}


let drag = simulation => {

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
}


