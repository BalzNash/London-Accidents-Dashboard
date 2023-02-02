export function drawPCA(pca_data) {
    var margin = {top: 30, right: 30, bottom: 30, left: 70},
    width = 600 - margin.left - margin.right,
    height = 365 - margin.top - margin.bottom;

    var svg = d3.select(".dimred")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

        svg.append("circle")//making a line for legend
          .attr("cx", 15)
          .attr("cy", -20)
          .attr("r", 5)       
          .style("fill", "#86D0CC")
          .style("stroke", "white")


        svg.append("text").attr("x", 28).attr("y", -17).text("selected borough").style("font-size", "13px").attr("alignment-baseline","middle")

      // Add X axis
    var x = d3.scaleLinear()
        .domain([-3, 3])
        .range([ 0, width ]);
    svg.append("g")
        .attr("class", "pca-axis1")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

// Add Y axis
    var y = d3.scaleLinear()
        .domain([-3, 3])
        .range([ height, 0]);
    svg.append("g")
        .attr("class", "pca-axis2")
        .call(d3.axisLeft(y));

    svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left+35)
        .attr("x", -margin.top-70)
        .text("Y axis title")
        .style("font-size", "12px") 
        .style("fill", "white")
        .style("stroke", "none") 
        .text("dimension 2");

    // Add X axis label:
    svg.append("text")
    .attr("text-anchor", "middle")
    .attr("x", width/2)
    .attr("y", height + margin.top )
    .style("font-size", "12px") 
    .style("fill", "white")
    .style("stroke", "none") 
    .text("dimension 1");

    // Add dots
    svg.append('g')
    .selectAll("dot")
    .data(pca_data, d => d.Local_Authority_Highway)
    .enter()
    .append("circle")
        .attr("cx", function (d) { return x(d.dim1); } )
        .attr("cy", function (d) { return y(d.dim2); } )
        .attr("r", 5)
        .attr("label", function(d) { return d.Local_Authority_Highway})
        .attr("name", function(d) { return d.name})
        .attr("class", "circlepca")
        .style("fill", "#86D0CC")
        .style("stroke", "white")


    var tooltip = d3.select(".dimred").append("div") 
    .attr("class", "tooltip")               
    .style("opacity", 0);

    var commaFormat = d3.format(',')


    d3.selectAll(".circlepca")
        .on("mouseover", mouseover)
        .on("mouseleave", mouseleave)

    function mouseover() {
        var selection = d3.select(this)

        selection.attr("r", 10)

        tooltip
        .transition()
        .duration(500)
        .style("opacity", .9);

        tooltip.html("borough: " + selection.attr("name"))
            .style("left", (d3.event.pageX - 25) + "px")		
            .style("top", (d3.event.pageY - 40) + "px");	

        d3.selectAll(".borough")
        .filter(function() {
                return d3.select(this).attr("code") == selection.attr("label"); // filter by single attribute
        })
            .style("stroke-width", "5px")
    }

    function mouseleave() {
        var selection = d3.select(this)

        selection.attr("r", 5)
        
        tooltip
            .style("opacity", "0")

        d3.selectAll(".borough")
        .filter(function() {
                return d3.select(this).attr("code") == selection.attr("label"); // filter by single attribute
        })
            .style("stroke-width", "1px")
    }

}

export function update_pca_colors(filters) {
    d3.selectAll(".circlepca")
    .filter(function() {
            return filters["boroughs"].includes(d3.select(this).attr("label"))
    })
        .style("fill", "#86D0CC")

    d3.selectAll(".circlepca")
    .filter(function() {
            return !(filters["boroughs"].includes(d3.select(this).attr("label")))
    })
        .style("fill", "#0C275F")               

}