function toggleVisibility(tabId) {
    console.log("Button clicked with tabId:", tabId);
    d3.selectAll("#densityCharts path").style("display", "none");

    if (tabId === "total") {
        d3.selectAll("#densityCharts path").style("display", null);
    } else {
        d3.select(`#densityCharts path.passenger_count_${tabId}`).style("display", null);
    }

}
d3.text("data/november_22.csv", function (csvText) {
    const data = d3.csvParse(csvText);

    data.forEach(d => {
        d.trip_distance = +d.trip_distance;
        d.passenger_count = +d.passenger_count;
    });

    const nestedData = d3.nest()
        .key(d => d.passenger_count)
        .entries(data);

    const mainSvg = d3.select("#densityCharts");

    const margin = { top: 20, right: 52, bottom: 40, left: 32 };
    const width = +mainSvg.attr("width") - margin.left - margin.right - 215;
    const height = +mainSvg.attr("height") - margin.top - margin.bottom;

    const xScale = d3.scaleLinear().domain([0, 15]).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, 1]).range([height, 0]);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);



    d3.select("#tabs")
        .selectAll(".tab-button")
        .on("click", function() {
            d3.selectAll(".tab-button").classed("active", false);

            d3.select(this).classed("active", true);

            toggleVisibility(d3.select(this).attr("data-tab"));
        });
    nestedData.forEach(group => {
        const histogram = d3.histogram()
            .domain([0, 75])
            .thresholds(d3.range(0, 80, 5));

        const bins = histogram(group.values.map(d => d.trip_distance));
        const totalCount = group.values.length;

        mainSvg.append("path")
            .datum(bins)
            .attr("fill", "none")
            .attr("stroke", colorScale(group.key))
            .attr("stroke-width", 2)
            .attr("transform", `translate(${margin.left}, ${margin.top})`)
            .attr("class", `passenger_count_${group.key}`)
            .attr("d", d3.line()
                .curve(d3.curveBasis)
                .x((d, i) => xScale(i))
                .y(d => yScale(d.length / totalCount))
            );
    });
    const legend = mainSvg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${margin.left}, ${margin.top - 20})`);

    const rectSize = 10; // 调整矩形的大小
    const spacing = 32;   // 调整矩形和文本之间的间距

    nestedData.forEach((group, idx) => {
        legend.append("rect")
            .attr("x", idx * (rectSize + spacing))
            .attr("y", 0)
            .attr("width", rectSize)
            .attr("height", rectSize)
            .attr("fill", colorScale(group.key))
            .attr("class", `legend-item passenger_count_${group.key}`);

        legend.append("text")
            .attr("x", idx * (rectSize + spacing) + rectSize + 2) // 调整文本的位置，使其在矩形的右侧
            .attr("y", rectSize / 2)  // 调整文本的纵向位置，使其垂直居中
            .attr("dy", "0.35em")
            .style("font-size", "8px")  // 设置字体大小
            .text(`Count ${group.key}`)
            .attr("fill", "black")
            .attr("class", `legend-item passenger_count_${group.key}`);
    });



    mainSvg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .call(d3.axisLeft(yScale));

    mainSvg.append("g")
        .attr("transform", `translate(${margin.left}, ${height + margin.top})`)
        .call(d3.axisBottom(xScale).tickValues(d3.range(0, 16, 1))
            .tickFormat((d, i) => (i * 5).toFixed(0) + "km")
        );
    mainSvg.attr("background-color", "lightgrey");
});

