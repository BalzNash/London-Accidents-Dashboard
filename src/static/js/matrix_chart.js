export function drawMatrixPlot(accidents) {

    var group_by_hour_weekday = d3.nest()
        .key(function(d) { return d.hour; })
        .key(function(d) { return d.weekday; })        
        .rollup(function(d) { return d.length})
        .map(accidents)

    var group_by_hour_weekday = group_by_hour_weekday.entries().map(function(d){
        return d.value.entries().map(function(e){
            return {
                "day": e.key,
                "hour": d.key,
                "count": e.value
            }
        })
    }).reduce(function(d1,d2){return d1.concat(d2)}, [])
     
    var days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
        days_verbose = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        times = d3.range(24);
    
    
    var margin = {
        top: 70,
        right: 50,
        bottom: 70,
        left: 100
    };
    
    var width = 590 - margin.left - margin.right - 20,
        gridSize = Math.floor(width / times.length),
        height = gridSize * (days.length+2);
    
    //SVG container
    var svg = d3.select('.crossfilter4')
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -25)
        .attr("x", -35)
        .text("Y axis title")
        .style("font-size", "12px") 
        .style("fill", "white")
        .style("stroke", "none") 
        .text("weekday");

        svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width/2)
        .attr("y", -17)
        .style("font-size", "12px") 
        .style("fill", "white")
        .style("stroke", "none") 
        .text("hour");
    
    var newFontSize = width * 62.5 / 900
    
    /*
    //Reset the overall font size
    var newFontSize = width * 62.5 / 900;
    d3.select("html").style("font-size", newFontSize + "%");
    */
    
    ///////////////////////////////////////////////////////////////////////////
    //////////////////////////// Draw Heatmap /////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
        
    //Based on the heatmap example of: http://blockbuilder.org/milroc/7014412
    
    var colorScale = d3.scaleLinear()
        .domain([0, d3.max(group_by_hour_weekday, function(d) {return d.count; })/2, d3.max(group_by_hour_weekday, function(d) {return d.count; })])
        .range(["#ffffd9", "#41b6c4", "#081d58"])
        //.interpolate(d3.interpolateHcl);
    
    var dayLabels = svg.selectAll(".dayLabel")
        .data(days)
        .enter().append("text")
        .text(function (d) { return d; })
        .attr("x", 0)
        .attr("y", function (d, i) { return i * gridSize; })
        .style("text-anchor", "end")
        .style("font-size", "10px")
        .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
        .attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); });
    
    var timeLabels = svg.selectAll(".timeLabel")
        .data(times)
        .enter().append("text")
        .text(function(d) { return d; })
        .attr("x", function(d, i) { return i * gridSize; })
        .attr("y", 0)
        .style("text-anchor", "middle")
        .style("font-size", "10px")
        .attr("transform", "translate(" + gridSize / 2 + ", -6)")
        .attr("class", function(d, i) { return ((i >= 8 && i <= 17) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });
    
    var heatMap = svg.selectAll(".hour")
        .data(group_by_hour_weekday, d => (d.hour.toString() + "." + d.day.toString()))
        .enter().append("rect")
        .attr("x", function(d) { return (d.hour) * gridSize; })
        .attr("y", function(d) { return (d.day) * gridSize; })
        .attr("hour", function(d) {return d.hour })
        .attr("day", function(d) {return days_verbose[d.day]})
        .attr("count", function(d) {return d.count})
        .attr("class", "hour bordered")
        .attr("width", gridSize)
        .attr("height", gridSize)
        .style("stroke-opacity", 0.6)
        .style("fill", function(d) { return colorScale(d.count); });
    
    ///////////////////////////////////////////////////////////////////////////
    //////////////// Create the gradient for the legend ///////////////////////
    ///////////////////////////////////////////////////////////////////////////
    
    //Extra scale since the color scale is interpolated
    var countScale = d3.scaleLinear()
        .domain([0, d3.max(group_by_hour_weekday, function(d) {return d.count; })])
        .range([0, width])
    
    //Calculate the variables for the temp gradient
    var numStops = 10;
    var countRange = countScale.domain();
    countRange[2] = countRange[1] - countRange[0];
    var countPoint = [];
    for(var i = 0; i < numStops; i++) {
        countPoint.push(i * countRange[2]/(numStops-1) + countRange[0]);
    }
    
    //Create the gradient
    svg.append("defs")
        .append("linearGradient")
        .attr("id", "legend-traffic")
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "100%").attr("y2", "0%")
        .selectAll("stop") 
        .data(d3.range(numStops))                
        .enter().append("stop") 
        .attr("offset", function(d,i) { 
            return countScale( countPoint[i] )/width;
        })   
        .attr("stop-color", function(d,i) { 
            return colorScale( countPoint[i] ); 
        });
    
    ///////////////////////////////////////////////////////////////////////////
    ////////////////////////// Draw the legend ////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    
    var legendWidth = Math.min(width*0.8, 400);
    //Color Legend container
    var legendsvg = svg.append("g")
        .attr("class", "legendWrapper")
        .attr("transform", "translate(" + (width/2) + "," + (gridSize * days.length + 40) + ")");
    
    //Draw the Rectangle
    legendsvg.append("rect")
        .attr("class", "legendRect")
        .attr("x", -legendWidth/2)
        .attr("y", 0)
        //.attr("rx", hexRadius*1.25/2)
        .attr("width", legendWidth)
        .attr("height", 10)
        .style("fill", "url(#legend-traffic)");
        
    //Append title
    legendsvg.append("text")
        .attr("class", "legendTitle")
        .attr("x", 0)
        .attr("y", -10)
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .text("accident count");
    
    //Set scale for x-axis
    var xScale = d3.scaleLinear()
         .range([-legendWidth/2, legendWidth/2])
         .domain([ 0, d3.max(group_by_hour_weekday, function(d) { return d.count; })] )
    
    
    //Set up X axis
    legendsvg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (10) + ")")
        .call(d3.axisBottom(xScale).ticks(5))


    var tooltip = d3.select(".crossfilter4").append("div") 
        .attr("class", "tooltip")               
        .style("opacity", 0);

    var commaFormat = d3.format(',')

    d3.selectAll(".hour.bordered")
        .on("mouseover", mouseover)
        .on("mouseleave", mouseleave)


    function mouseover() {
        var selection = d3.select(this)

        tooltip
        .transition()
        .duration(500)
        .style("opacity", .9);

        tooltip.html("day: " + selection.attr("day") + "<br>"
                     + "hour: " + selection.attr("hour") + "<br>"
                     + "count: " + commaFormat(selection.attr("count")))	
        .style("left", (d3.event.pageX - 17) + "px")		
        .style("top", (d3.event.pageY - 70) + "px");	
    }

    function mouseleave() {
        tooltip
            .style("opacity", "0")
    }

    }

    export function updateMatrixChart(filtered_data_matrix) {

        var group_by_hour_weekday = d3.nest()
        .key(function(d) { return d.hour; })
        .key(function(d) { return d.weekday; })        
        .rollup(function(d) { return d.length})
        .map(filtered_data_matrix)

        var group_by_hour_weekday = group_by_hour_weekday.entries().map(function(d){
                return d.value.entries().map(function(e){
                    return {
                        "day": e.key,
                        "hour": d.key,
                        "count": e.value
                    }
                })
            }).reduce(function(d1,d2){return d1.concat(d2)}, [])

        var width = 420
            
        var colorScale = d3.scaleLinear()
                            .domain([0, d3.max(group_by_hour_weekday, function(d) {return d.count; })/2, d3.max(group_by_hour_weekday, function(d) {return d.count; })])
                            .range(["#ffffd9", "#41b6c4", "#081d58"])


        var matrix_cells = d3.selectAll(".hour.bordered")
                              .data(group_by_hour_weekday, d => (d.hour.toString() + "." + d.day.toString()))
        
        matrix_cells
            .transition()
            .duration(200)
            .style("fill", function(d) {return colorScale(d.count)})
            .attr("count", function(d) { return d.count})

        matrix_cells
            .exit()
            .transition()
            .duration(200)
            .attr("count", function(d) { return 0})
            .style("fill", "#FFFFDD")
        
        //Extra scale since the color scale is interpolated
        var countScale = d3.scaleLinear()
            .domain([0, d3.max(group_by_hour_weekday, function(d) {return d.count; })])
            .range([0, width])

        //Calculate the variables for the temp gradient
        var numStops = 10;
        var countRange = countScale.domain();
        countRange[2] = countRange[1] - countRange[0];
        var countPoint = [];
        for(var i = 0; i < numStops; i++) {
            countPoint.push(i * countRange[2]/(numStops-1) + countRange[0]);
        }
        
        d3.select(".crossfilter4")
          .selectAll("stop")
          .attr("offset", function(d,i) { 
            return countScale( countPoint[i] )/width;
          })
          .attr("stop-color", function(d,i) { 
                return colorScale( countPoint[i] ); 
          });

        var legendWidth = Math.min(width*0.8, 400);

        var hour_weekday_scale = d3.scaleLinear()
            .range([-legendWidth/2, legendWidth/2])
            .domain([ 0, d3.max(group_by_hour_weekday, function(d) { return d.count; })] )

        d3.select(".crossfilter4")
            .select(".legendWrapper")
            .select(".axis")
            .transition()
            .duration(1000)
            .call(d3.axisBottom(hour_weekday_scale).ticks(5))
    }