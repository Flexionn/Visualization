// set the dimensions and margins of the graph
  const margin1 = {top: 20, right: 110, bottom: 0, left: 50},
     width1 = 1070  - margin1.left - margin1.right,
     height1 = 300 - margin1.top - margin1.bottom;

// append the svg object to the body of the page
const svgjesse = d3.select("#calender-container")
    .append("svg")
    .attr("width", width1 + margin1.left + margin1.right)
    .attr("height", height1 + margin1.top + margin1.bottom)
    .append("g")
    .attr("transform", `translate(${margin1.left}, ${margin1.top})`);

//Read the data
d3.csv("data/calender_values.csv").then(function(data) {
    // const minHeat = d3.min(data, (d) => d.heat);
    // const maxHeat = d3.max(data, (d) => d.heat);
    // Labels of row and columns -> unique identifier of the column called 'group' and 'variable'
    const myGroups = Array.from(new Set(data.map(d => d.x)))
    const myVars = Array.from(new Set(data.map(d => d.y)))

    // Build X scales and axis:
    const x = d3.scaleBand()
        .range([ 0, width1 ])
        .domain(myGroups)
        .padding(0.05);
    svgjesse.append("g")
        .style("font-size", 15)
        .attr("transform", `translate(0, 0)`)
        .call(d3.axisTop(x).tickSize(0))
        .select(".domain").remove()

    // Build Y scales and axis:
    const y = d3.scaleBand()
        .range([0, height1])
        .domain(myVars)
        .padding(0.05);
    svgjesse.append("g")
        .style("font-size", 15)
        .call(d3.axisLeft(y).tickSize(0))
        .select(".domain").remove()

    // Build color scale
    const myColor = d3.scaleSequential()
        .interpolator(d3.interpolateReds)
        .domain([69663,132727])


    // create a tooltip
    const tooltip = d3.select("#calender-container")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px");

    // Three functions that change the tooltip when user hover / move / leave a cell
    const mouseover = function(event,d) {
        tooltip
            .style("opacity", 1);
        d3.select(this)
            .style("stroke", "black")
            .style("opacity", 1);
    };

    const mousemove = function(event,d) {
        tooltip
            .html("The exact number of trips on " + d.x + " "+ d.date + " is: " + d.heat)
            .style("left", (event.x) / 2 + "px")
            .style("top", (event.y) / 2 + "px")
    }
    const mouseleave = function(event,d) {
        tooltip
            .style("opacity", 0);
        d3.select(this)
            .style("stroke", "none")
            .style("opacity", 0.8);
    };


    // add the squares
    svgjesse.selectAll()
        .data(data, function(d) {return d.x+':'+d.y;})
        .join("rect")
        .attr("x", function(d) { return x(d.x) })
        .attr("y", function(d) { return y(d.y) })
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("width", x.bandwidth() )
        .attr("height", y.bandwidth() )
        .style("fill", function (d) {return myColor(d.heat)})
        .style("stroke-width", 4)
        .style("stroke", "none")
        .style("opacity", 0.8)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

// add text displaying date and heat values within each square
    svgjesse.selectAll()
        .data(data, function (d) { return d.x + ':' + d.y; })
        .join("text")
        .attr("x", function (d) { return x(d.x) + x.bandwidth() / 2; })
        .attr("y", function (d) { return y(d.y) + y.bandwidth() / 2 - 10; }) // adjust the y-coordinate for date text
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "black")
        .text(function (d) { return d.date; });


    // Create a formatting function for the heat values
    const formatHeat = d3.format(","); // Use a comma as a thousand separator

// add text displaying heat values within each square
    svgjesse.selectAll()
        .data(data, function (d) { return d.x + ':' + d.y; })
        .join("text")
        .attr("x", function (d) { return x(d.x) + x.bandwidth() / 2; })
        .attr("y", function (d) { return y(d.y) + y.bandwidth() / 2 + 10; }) // adjust the y-coordinate for heat text
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "black")
        .text(function(d) { return formatHeat(d.heat); }); // Use the formatting function


// Create color legend
    const legend = svgjesse.selectAll(".legend")
        .data(myColor.range())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) { return "translate(" + (width1 + 18) + "," + i * 20 + ")"; });

    legend.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function (d) { return d; });

    legend.append("text")
        .attr("x", 26)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(function (d, i) {
            const range = myColor.invertExtent(d);
            return `${Math.floor(range[0])} - ${Math.floor(range[1])}`;
        });
});



// Add legend
svgjesse.append("text")
    .attr("x", width1 + 45)
    .attr("y", 30)
    .text("High Value")
    .style("font-size", "12px")
    .attr("alignment-baseline", "middle");

svgjesse.append("text")
    .attr("x", width1 + 45)
    .attr("y", 12)
    .text("Low Value")
    .style("font-size", "12px")
    .attr("alignment-baseline", "middle");


