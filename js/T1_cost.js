var margin = {top: 20, right: 20, bottom: 30, left: 40};
var width = 968 - margin.left - margin.right;
var height =  500 - margin.top - margin.bottom;

var x0 = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

var x1 = d3.scale.ordinal();

var y = d3.scale.linear()
    .range([height, 0]);

var color = d3.scale.ordinal()
    .range(["#384E77", "#558A57", "#DBBB19"]);

var xAxis = d3.svg.axis()
    .scale(x0)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3.format(".2s"));

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("../nov_22.csv", function (error, data) {
    data = data.reduce((arr, d) => {
        if(d["passenger_count"] == "0") (arr[0] = arr[0] || []).push(d);
        else if(d["passenger_count"] == "1") (arr[1] = arr[1] || []).push(d);
        else if(d["passenger_count"] == "2") (arr[2] = arr[2] || []).push(d);
        else if(d["passenger_count"] == "3") (arr[3] = arr[3] || []).push(d);
        else if(d["passenger_count"] == "4") (arr[4] = arr[4] || []).push(d);
        else if(d["passenger_count"] == "5") (arr[5] = arr[5] || []).push(d);
        else if(d["passenger_count"] == "6") (arr[6] = arr[6] || []).push(d);
        else if(d["passenger_count"] == "7") (arr[7] = arr[7] || []).push(d);
        else if(d["passenger_count"] == "8") (arr[8] = arr[8] || []).push(d);
        else if(d["passenger_count"] == "9") (arr[9] = arr[9] || []).push(d);
        return arr;
    }, []);

    function ensureNumbers(array){
        return array.map(value=>{
            if(typeof value==='string'){
                return parseFloat(value);
            }
            return value;
        }).filter(value =>typeof value ==='number'&&!isNaN(value));
    }


    for(let i = 0;i<data.length;i++){
        let obj = {"Passengers":i,"fareAmount": [{"name":"Fare","value":0},{"name":"Tip","value":0},{"name":"Total","value":0}]};
        const fareAmounts = ensureNumbers(data[i].map(list=>list["fare_amount"]));
        const tipAmounts = ensureNumbers(data[i].map(list=>list["tip_amount"]));
        const totalAmounts = ensureNumbers(data[i].map(list=>list["total_amount"]));
        console.log(tipAmounts);
        obj.fareAmount[0].value = isNaN(fareAmounts.reduce((sum, d) => sum + d,0)/fareAmounts.length) ? 0 : fareAmounts.reduce((sum, d) => sum + d,0)/fareAmounts.length;
        obj.fareAmount[1].value = isNaN(tipAmounts.reduce((sum, d) => sum + d,0)/tipAmounts.length) ? 0 : tipAmounts.reduce((sum, d) => sum + d,0)/tipAmounts.length;
        obj.fareAmount[2].value = isNaN(totalAmounts.reduce((sum, d) => sum + d,0)/totalAmounts.length) ? 0 : totalAmounts.reduce((sum, d) => sum + d,0)/totalAmounts.length;
        data[i] = obj;
    }

    console.log(data);

    // var passengers = d3.keys(data[0]).filter(function(key) { return key !== "Passengers"; });
    var passengers = ["Fare","Tip","Total"];
    // data.forEach(function(d) {
    //     d.fareAmount = passengers.map(function(name) {
    //         return { name: name, value: +d[name]};
    //     });
    // });

    x0.domain(data.map(function(d) { return d.Passengers; }));
    x1.domain(passengers).rangeRoundBands([0, x0.rangeBand()]);
    // y.domain([0, d3.max(data, function(d) { return d3.max(d.fareAmount, function(d) { return d.value; }); })]);
    y.domain([0, d3.max(data.map(x=>x.fareAmount).flat().map(y=>y.value))]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Amount ($)");

    var state = svg.selectAll(".state")
        .data(data)
        .enter().append("g")
        .attr("class", "g")
        .attr("transform", function(d) { return "translate(" + x0(d.Passengers) + ",0)"; });

    state.selectAll("rect")
        .data(function(d) { return d.fareAmount; })
        .enter().append("rect")
        .attr("width", x1.rangeBand())
        .attr("x", function(d) { return x1(d.name); })
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); })
        .style("fill", function(d) { return color(d.name); })
        .on("mouseover", onMouseOver)
        .on("mouseout", onMouseOut);

    var legend = svg.selectAll(".legend")
        .data(passengers.slice().reverse())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18).attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9).attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d; });
});

function onMouseOver(d, i) {
    var xPos = parseFloat(d3.select(this).attr('x')) + x1.rangeBand() / 2;
    var yPos = parseFloat(d3.select(this).attr('y')) / 2 + height / 2;

    d3.select('#tooltip')
        .style('left', xPos + 'px')
        .style('top', yPos + 'px')
        .select('#value').text(d[name]);

    d3.select('#tooltip').classed('hidden', false);

    d3.select(this).attr('class','highlight')
    d3.select(this)
        .transition()
        .duration(500)
        .attr('width', x1.rangeBand() + 5)
        .attr('y', function(d) { return y(d.value) - 10; })
        .attr('height', function(d) { return height - y(d.value) + 10; });
}

function onMouseOut(d, i){
    d3.select(this).attr('class','bar')

    d3.select(this)
        .transition()
        .duration(500)
        .attr('width', x1.rangeBand())
        .attr('y', function(d) { return y(d.value); })
        .attr('height', function(d) { return height - y(d.value); });

    d3.select('#tooltip').classed('hidden', true);
}