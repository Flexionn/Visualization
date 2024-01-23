var width = 1070,
    height = 600;

const hourApp = {};

d3.csv("data/hourgraph_calculated.csv", function(data) {
    let formattedData = [];

    data.forEach((dataObj) => {
        const { Day, Hour, Count } = dataObj;

        if (!formattedData[parseInt(Day)]) {
            formattedData[parseInt(Day)] = {day : parseInt(Day), value: []};
        }

        formattedData[parseInt(Day)].value.push({hour: parseInt(Hour), value: parseInt(Count)});
    });

    // Initial selection of days
    var selectedDays = [1, 2, 3, 4, 5, 6, 7];

    var xScale = d3.scaleBand().range([40, width - 40]).padding(0.1),
        yScale = d3.scaleLinear().range([height/2, 0]);

    xScale.domain(formattedData.flatMap(day => day.value.map(hourData => hourData.hour)));
    yScale.domain([0, d3.max(formattedData.flatMap(day => day.value.map(hourData => hourData.value)))]);

    var svg = d3.select("#visualization4")
        .append("svg")
        .attr("width", width)
        .attr("height", height/2 + 20);

    var g = svg.append("g")
        .attr("transform", "translate(" + 50 + "," + 20 + ")");

    // X-axis
    var xAxis = d3.axisBottom(xScale);

    svg.append("g")
        .attr("transform", "translate(10," + (height/2) + ")")
        .call(xAxis);

    // Y-axis
    var yAxis = d3.axisLeft(yScale);

    svg.append("g")
        .attr("transform", "translate(50, 0)")
        .call(yAxis);

    // Color scale for the lines
    var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Generate line
    var line = d3.line()
        .x(function(d) { return xScale(d.hour) + xScale.bandwidth() - 11; })
        .y(function(d) { return yScale(d.value); });

    drawLines();

    function drawLines() {
        console.log("drawLines");
        svg.selectAll(".line").remove();
        svg.selectAll(".line")
            .data(formattedData.filter(day => selectedDays.includes(day.day)))
            .enter().append("path")
            .attr("class", "line")
            .attr("d", function(d) { return line(d.value); })
            .style("stroke", function(d, i) { return colorScale(i); })
            .on("mouseover", function(d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style("stroke-width", 5);

                var mouseX = d3.mouse(this)[0];
                var invertedX = Math.round(mouseX / xScale.step() - 1.9);

                var tooltipText = "<b>" + d.day + " November 2022</b><br>" + invertedX + ":00 - " + (invertedX + 1) + ":00<br>Taxi rides: " + d.value[invertedX].value;

                tooltip.transition()
                    .duration(100)
                    .style("opacity", .92);
                tooltip.html(tooltipText)
                    .style("left", (d3.event.pageX) + "px") // Really sketchy
                    .style("top", (d3.event.pageY) + "px"); // Really sketchy
            })
            .on("mouseout", function(d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style("stroke-width", 2);

                tooltip.transition()
                    .duration(300)
                    .style("opacity", 0);
            });
    }

    var tooltip = d3.select("#visualization4").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Add function to app so it's accessible from the datepicker
    hourApp.updateChart = updateChart;

    function updateChart(days) {
        selectedDays = days;
        console.log("updateChart");
        drawLines();
    }
});