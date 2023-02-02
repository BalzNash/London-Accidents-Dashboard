export function drawMap(data, boroughs) {
    // Map and projection
    var projection = d3.geoMercator()
        .scale(27000)
        .center([0.28, 51.410666])

    var margin = {top: 30, right: 0, bottom: 10, left: 0},
        width = 610 - margin.left - margin.right,
        height = 480 - margin.top - margin.bottom;
    
    var features = boroughs.features

    features.forEach(myFunction)
    
    function myFunction(item) {
      item.key = item.properties.code
    }

    // Data and color scale

    var accident_count = d3.nest()
      .key(function(d) { return d.Local_Authority_Highway; })
      .rollup(function(d) { return d.length})
      .map(data)

    var max_count = d3.max(accident_count.entries().map(a => a.value))

      var colorScale = d3.scaleLinear()
            .domain([0, (max_count / 2), max_count])
            .range(["#ffffd9", "#41b6c4", "#081d58"]);
  
      d3.select('.map').append('svg')
                        .attr("width", width)
                        .attr("height", height)
                        .append("g")
                        .selectAll("path")
                        .data(features, d => d.key)
                        .enter()
                        .append("path")
                        .attr("code", function(d) {return d.properties.code})
                        .attr("name", function(d) {return d.properties.name})
                        .attr("size", function(d) {return d.properties.area_hectares})
                        // draw each country
                        .attr("d", d3.geoPath()
                        .projection(projection)
  
        )
        // set the color of each country
        
        .attr("count", function (d) {
          d.total = accident_count.get(d.properties.code) || 0;
          return d.total;
        })
  
        .attr("fill", function() {
          return colorScale(this.getAttribute("count"))
        })
  
        .style("stroke", "black")
        .attr("class", function(d){ return "borough" } )
        
        .style("opacity", .8)


        
    var svg = d3.select("svg");

    //Extra scale since the color scale is interpolated
    var countScale = d3.scaleLinear()
        .domain([0, max_count])
        .range([0, width])
    
    //Calculate the variables for the temp gradient
    var numStops = 10;
    var countRange = countScale.domain();
    countRange[2] = countRange[1] - countRange[0];
    var countPoint = [];
    for(var i = 0; i < numStops; i++) {
        countPoint.push(i * countRange[2]/(numStops-1) + countRange[0]);
    }//for i
    
    //Create the gradient
    svg.append("defs")
        .append("linearGradient")
        .attr("id", "legend-traffic2")
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

/////////////////////////////////////////////////////////////////////////////////////////

    var legendWidth = Math.min(width*0.8, 400);
    //Color Legend container
    var legendsvg = svg.append("g")
        .attr("class", "legendWrapper")
        .attr("transform", "translate(" + (width/2) + "," + (380) + ")");

    //Draw the Rectangle
    legendsvg.append("rect")
        .attr("class", "legendRect")
        .attr("x", -legendWidth/2)
        .attr("y", 0)
        //.attr("rx", hexRadius*1.25/2)
        .attr("width", legendWidth)
        .attr("height", 10)
        .style("fill", "url(#legend-traffic2)");
        
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
        .domain([0, max_count])


    //Set up X axis
    legendsvg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (10) + ")")
        .call(d3.axisBottom(xScale).ticks(5))

    var tooltip = d3.select(".map").append("div") 
        .attr("class", "tooltip")               
        .style("opacity", 0);

    var commaFormat = d3.format(',')

    d3.selectAll(".borough")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)


    function mouseover() {

        var selection = d3.select(this)

        tooltip
        .transition()
        .duration(500)
        .style("opacity", .9);

        tooltip.html("borough: " + selection.attr("name") + "<br>"
                    +"accident count: " + commaFormat(selection.attr("count")) + "<br>"
                    +"size (hectares): " + commaFormat(selection.attr("size")))	
        .style("left", (d3.event.pageX - 17) + "px")		
        .style("top", (d3.event.pageY - 25) + "px");
        
        d3.selectAll("circle")
                        .filter(function() {
                        return d3.select(this).attr("label") == selection.attr("code"); // filter by single attribute
          })
            .attr("r", 10)
        }

    function mousemove() {

        tooltip
        .style("left", (d3.event.pageX - 17) + "px")		
        .style("top", (d3.event.pageY - 40) + "px");	
    }

    function mouseleave() {

        tooltip
        .style("opacity", "0")

        var selection = d3.select(this)
        d3.selectAll("circle")
                .filter(function() {
                        return d3.select(this).attr("label") == selection.attr("code"); // filter by single attribute
        })
          .attr("r", 5)

    }

  }


  export function updateMap(filtered_data_borough) {
      
    var width = 610 // has to be modified

    var borough_group = d3.nest()
        .key(function(d) { return d.Local_Authority_Highway; })
        .rollup(function(d) { return d.length})
        .map(filtered_data_borough)

    borough_group = borough_group.entries()

    var max_count = d3.max(borough_group.map(a => a.value))


    var colorScale = d3.scaleLinear()
        .domain([0, (max_count / 2), max_count])
        .range(["#ffffd9", "#41b6c4", "#081d58"]);
    
    
    var boroughs = d3.select(".map")
                        .selectAll(".borough")
                        .data(borough_group, function(d) { return d.key})

    boroughs
        .attr("count", function(d) {return d.value})
        .attr("fill", function(d) {return colorScale(d.value)})

    boroughs
        .exit()
        .attr("count", function(d) { return 0})
        .attr("fill", "#FFFFDD")

    // update legend

    //Extra scale since the color scale is interpolated
    var countScale = d3.scaleLinear()
        .domain([0, max_count])
        .range([0, width])

    //Calculate the variables for the temp gradient
    var numStops = 10;
    var countRange = countScale.domain();
    countRange[2] = countRange[1] - countRange[0];
    var countPoint = [];
    for(var i = 0; i < numStops; i++) {
        countPoint.push(i * countRange[2]/(numStops-1) + countRange[0]);
    }

    d3.select(".map")
    .selectAll("stop")
    .attr("offset", function(d,i) { 
      return countScale( countPoint[i] )/width;
    })
    .attr("stop-color", function(d,i) { 
          return colorScale( countPoint[i] ); 
    });
    
    var legendWidth = Math.min(width*0.8, 400);

    var borough_gradient_scale = d3.scaleLinear()
        .range([-legendWidth/2, legendWidth/2])
        .domain([ 0, max_count] )

    d3.select(".map")
    .select(".legendWrapper")
    .select(".axis")
    .transition()
    .duration(1000)
    .call(d3.axisBottom(borough_gradient_scale).ticks(5))

  }