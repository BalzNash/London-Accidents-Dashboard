export function drawBarCharts(accidents) {

    var days = {0: "Su", 
                1: "Mo",
                2: "Tu",
                3: "We",
                4: "Th",
                5: "Fr",
                6: "Sa"}

    var months =  {0: "Jan",
                   1: "Feb",
                    2: "Mar",
                    3: "Apr",
                    4: "May",
                    5: "Jun",
                    6: "Jul",
                    7: "Aug",
                    8: "Sep",
                    9: "Oct",
                    10: "Nov",
                    11: "Dec"}

    var hour_group = d3.nest()
        .key(function(d) { return d.hour; })
        .rollup(function(d) { return d.length})
        .map(accidents)

    var weekday_group = d3.nest()
        .key(function(d) { return d.weekday; })
        .rollup(function(d) { return d.length})
        .map(accidents)

    var month_group = d3.nest()
        .key(function(d) { return d.month; })
        .rollup(function(d) { return d.length})
        .map(accidents)

    hour_group = hour_group.entries().sort(function(x, y){ return d3.ascending(+x.key, +y.key);})
    weekday_group = weekday_group.entries().sort(function(x, y){ return d3.ascending(+x.key, +y.key);})
    month_group = month_group.entries().sort(function(x, y){ return d3.ascending(+x.key, +y.key);})
    

    var margin = {top: 55, right: 0, bottom: 70, left: 70},
    width = 590 - margin.left - margin.right,
    height = 310 - margin.top - margin.bottom;

    var values = hour_group.map(x => x.value)
    var avg = (values.reduce((a, b) => a + b, 0) / values.length) || 0
    var sd = Math.sqrt(values.map(x => Math.pow(x - avg, 2)).reduce((a, b) => a + b) / values.length)

    console.log(avg, sd)


  // append the svg object to the body of the page
    var svg = d3.select(".crossfilter1")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleBand()
        .range([ 0, width ])
        .domain(hour_group.map(a => a.key))
        .padding(0.2);
    
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", "axis")
        .call(d3.axisBottom(x));

  // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, d3.max(hour_group.map(d => d.value))])
        .range([ height, 0]);

    svg.append("g")
        .attr("class", "axis y")
        .call(d3.axisLeft(y).ticks(5));

  // Bars
    svg.selectAll("mybar")
        .data(hour_group, d => d.key)
        .enter()
        .append("rect")
        .attr("class", "bar hour")
        .attr("x", function(d) { return x(d.key); })
        .attr("y", function(d) { return y(d.value); })
        .attr("label", function(d) { return d.key})
        .attr("count", function(d) { return d.value})
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height - y(d.value); })
        .attr("fill", "#86D0CC")

    svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left+20)
        .attr("x", -margin.top)
        .text("Y axis title")
        .style("font-size", "12px") 
        .style("fill", "white")
        .style("stroke", "none") 
        .text("accident count");

// Add X axis label:
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width/2)
        .attr("y", height + margin.top - 24)
        .style("font-size", "12px") 
        .style("fill", "white")
        .style("stroke", "none") 
        .text("hour");


    svg.append("svg:line")
        .attr("class", "avg-line hour")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", y(avg))
        .attr("y2", y(avg))

    svg.append("line")//making a line for legend
        .attr("x1", 15)
        .attr("x2", 30)
        .attr("y1", -20)
        .attr("y2", -20)
        .style("stroke-dasharray","3,3")//dashed array for line
        .style("stroke", "#5445d8");
    svg.append("text").attr("x", 45).attr("y", -17).text("avg").style("font-size", "13px").attr("alignment-baseline","middle")

    svg.append("line")//making a line for legend
    .attr("x1", 80)
    .attr("x2", 95)
    .attr("y1", -20)
    .attr("y2", -20)
    .style("stroke-dasharray","3,3")//dashed array for line
    .style("stroke", "#d86f45");
    svg.append("text").attr("x", 110).attr("y", -17).text("± 1 standard deviation").style("font-size", "13px").attr("alignment-baseline","middle")

    svg.append("svg:line")
        .attr("class", "sdup hour")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", y(avg + sd))
        .attr("y2", y(avg + sd))

    svg.append("svg:line")
        .attr("class", "sddown hour")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", y(avg - sd))
        .attr("y2", y(avg - sd))

  /////////////////
  //weekday barchart
  //////////////////

    var width2 = width /2.5
    var height2 = height - 30
    var margin_top2 = margin.top - 15

    var values = weekday_group.map(x => x.value)
    var avg = (values.reduce((a, b) => a + b, 0) / values.length) || 0
    var sd = Math.sqrt(values.map(x => Math.pow(x - avg, 2)).reduce((a, b) => a + b) / values.length)

  // append the svg object to the body of the page
    var svg = d3.select(".crossfilter2")
        .append("svg")
            .attr("width", width2 + margin.left + margin.right)
            .attr("height", height2 + margin_top2 + margin.bottom)
        .append("g")
            .attr("transform",
                "translate(" + (margin.left) + "," + margin_top2 + ")");

    var x = d3.scaleBand()
        .range([ 0, width2 ])
        .domain(weekday_group.map(a => days[a.key]))
        .padding(0.2);
        svg.append("g")
        .attr("transform", "translate(0," + height2 + ")")
        .attr("class", "axis")
        .call(d3.axisBottom(x));

  // Add Y axis
    var y = d3.scaleLinear()
        .domain([0,d3.max(weekday_group.map(d => d.value))])
        .range([ height2, 0]);

    svg.append("g")
        .attr("class", "axis y")
        .call(d3.axisLeft(y).ticks(5));

  // Bars
    svg.selectAll("mybar")
        .data(weekday_group, d => d.key)
        .enter()
        .append("rect")
            .attr("class", "bar weekday")
            .attr("x", function(d) { return x(days[d.key]); })
            .attr("y", function(d) { return y(d.value); })
            .attr("label", function(d) { return d.key})
            .attr("count", function(d) { return d.value})
            .attr("width", x.bandwidth())
            .attr("height", function(d) { return height2 - y(d.value); })
            .attr("fill", "#86D0CC")

    svg.append("text")
            .attr("text-anchor", "middle")
            .attr("x", width2/2)
            .attr("y", height2 + margin_top2 - 10)
            .style("font-size", "12px") 
            .style("fill", "white")
            .style("stroke", "none") 
            .text("weekday");

    svg.append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left+20)
    .attr("x", -margin_top2)
    .text("Y axis title")
    .style("font-size", "12px") 
    .style("fill", "white")
    .style("stroke", "none") 
    .text("accident count");

    svg.append("svg:line")
        .attr("class", "avg-line weekday")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", y(avg))
        .attr("y2", y(avg))

    svg.append("svg:line")
        .attr("class", "sdup weekday")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", y(avg + sd))
        .attr("y2", y(avg + sd))

    svg.append("svg:line")
        .attr("class", "sddown weekday")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", y(avg - sd))
        .attr("y2", y(avg - sd))

    svg.append("line")//making a line for legend
        .attr("x1", -15)
        .attr("x2", 0)
        .attr("y1", -20)
        .attr("y2", -20)
        .style("stroke-dasharray","3,3")//dashed array for line
        .style("stroke", "#5445d8");

    svg.append("text").attr("x", 15).attr("y", -17).text("avg").style("font-size", "13px").attr("alignment-baseline","middle")

    svg.append("line")//making a line for legend
    .attr("x1", 50)
    .attr("x2", 65)
    .attr("y1", -20)
    .attr("y2", -20)
    .style("stroke-dasharray","3,3")//dashed array for line
    .style("stroke", "#d86f45");
    svg.append("text").attr("x", 77).attr("y", -17).text("± 1 standard deviation").style("font-size", "13px").attr("alignment-baseline","middle")


////////////////////
// month chart
///////////////////

var width2 = width /2.5
var values = month_group.map(x => x.value)
var avg = (values.reduce((a, b) => a + b, 0) / values.length) || 0
var sd = Math.sqrt(values.map(x => Math.pow(x - avg, 2)).reduce((a, b) => a + b) / values.length)

// append the svg object to the body of the page
  var svg = d3.select(".crossfilter3")
      .append("svg")
          .attr("width", width2 + margin.left + margin.right)
          .attr("height", height2 + margin_top2 + margin.bottom)
      .append("g")
          .attr("transform",
              "translate(" + (margin.left) + "," + margin_top2 + ")");

  var x = d3.scaleBand()
      .range([ 0, width2 ])
      .domain(month_group.map(a => a.key))
      .padding(0.2);
      svg.append("g")
      .attr("transform", "translate(0," + height2 + ")")
      .attr("class", "axis")
      .call(d3.axisBottom(x).tickFormat((i) => { return months[i]}))
      .attr("letter-spacing", function(d,i) {return i*.05-.05 + "em"; })

// Add Y axis
  var y = d3.scaleLinear()
      .domain([0, d3.max(month_group.map(d => d.value))])
      .range([ height2, 0]);

  svg.append("g")
      .attr("class", "axis y")
      .call(d3.axisLeft(y).ticks(5));

// Bars
  svg.selectAll("mybar")
      .data(month_group, d => d.key)
      .enter()
      .append("rect")
          .attr("class", "bar month")
          .attr("x", function(d) { return x(d.key); })
          .attr("y", function(d) { return y(d.value); })
          .attr("label", function(d) { return d.key})
          .attr("count", function(d) { return d.value})
          .attr("width", x.bandwidth())
          .attr("height", function(d) { return height2 - y(d.value); })
          .attr("fill", "#86D0CC")

    svg.append("text")
    .attr("text-anchor", "middle")
    .attr("x", width2/2)
    .attr("y", height2 + margin_top2 - 10)
    .style("font-size", "12px") 
    .style("fill", "white")
    .style("stroke", "none") 
    .text("month");

    svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left+20)
        .attr("x", -margin_top2)
        .text("Y axis title")
        .style("font-size", "12px") 
        .style("fill", "white")
        .style("stroke", "none") 
        .text("accident count");

    svg.append("svg:line")
        .attr("class", "avg-line month")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", y(avg))
        .attr("y2", y(avg))

    svg.append("svg:line")
        .attr("class", "sdup month")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", y(avg + sd))
        .attr("y2", y(avg + sd))

    svg.append("svg:line")
        .attr("class", "sddown month")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", y(avg - sd))
        .attr("y2", y(avg - sd))

    svg.append("line")//making a line for legend
        .attr("x1", -15)
        .attr("x2", 0)
        .attr("y1", -20)
        .attr("y2", -20)
        .style("stroke-dasharray","3,3")//dashed array for line
        .style("stroke", "#5445d8");

    svg.append("text").attr("x", 15).attr("y", -17).text("avg").style("font-size", "13px").attr("alignment-baseline","middle")

    svg.append("line")//making a line for legend
    .attr("x1", 50)
    .attr("x2", 65)
    .attr("y1", -20)
    .attr("y2", -20)
    .style("stroke-dasharray","3,3")//dashed array for line
    .style("stroke", "#d86f45");
    svg.append("text").attr("x", 77).attr("y", -17).text("± 1 standard deviation").style("font-size", "13px").attr("alignment-baseline","middle")

    

    var tooltip = d3.select(".crossfilter1").append("div") 
    .attr("class", "tooltip")               
    .style("opacity", 0);

    var commaFormat = d3.format(',')


    d3.selectAll(".bar")
        .on("mouseover", mouseover)
        .on("mouseleave", mouseout)

    function mouseover() {
        var matrix = this.getScreenCTM()
                         .translate(+ this.getAttribute("x"), + this.getAttribute("y"))

        var selection = d3.select(this)

        tooltip
        .transition()
        .duration(500)
        .style("opacity", .9);

        var plot_type = selection.attr("class").split(" ")[1]

        tooltip.html("" + plot_type + ": " + selection.attr("label") + "<br>"
                        + "count: " + commaFormat(selection.attr("count")))	
        .style("left", (window.pageXOffset + matrix.e) + "px")		
        .style("top", (window.pageYOffset + matrix.f - 45) + "px");	
    }

    function mouseout() {
        tooltip
        .transition()
        .duration(500)
        .style("opacity", 0);		
    }

}


export function updateHourBarchart(filtered_data_hour) {
    
    var hour_group = d3.nest()
        .key(function(d) { return d.hour; })
        .rollup(function(d) { return d.length})
        .map(filtered_data_hour)
    
    hour_group = hour_group.entries().sort(function(x, y){ return d3.ascending(+x.key, +y.key);})

    var height = 185  // da cambiare, ora è hardcoded

    //update bar by hour

    var y = d3.scaleLinear()
        .domain([0, d3.max(hour_group.map(d => d.value))])
        .range([ height, 0]);

    d3.select(".crossfilter1")
    .select(".axis.y")
    .transition()
    .duration(1000)
    .call(d3.axisLeft(y).ticks(5))

    var bars = d3.select(".crossfilter1")
            .select("svg")
            .selectAll(".bar")
            .data(hour_group, d => d.key)

    bars.transition()
    .duration(1000)
    .attr("y", function(d) { return y(d.value); })
    .attr("height", function(d) { return height - y(d.value); })
    .attr("count", function(d) { return d.value})

    bars.exit()
    .transition()
    .duration(1000)
    .attr("y", function(d) {return height})
    .attr("height", function(d) { return 0 })
    .attr("count", function(d) { return 0})

    var values = hour_group.map(x => x.value)
    var avg = (values.reduce((a, b) => a + b, 0) / values.length) || 0
    var sd = Math.sqrt(values.map(x => Math.pow(x - avg, 2)).reduce((a, b) => a + b) / values.length)

    d3.select(".avg-line.hour")
        .transition()
        .duration(1000)
        .attr("y1", y(avg))
        .attr("y2", y(avg))

        d3.select(".sdup.hour")
        .transition()
        .duration(1000)
        .attr("y1", y(avg + sd))
        .attr("y2", y(avg + sd))

        d3.select(".sddown.hour")
        .transition()
        .duration(1000)
        .attr("y1", y(avg - sd))
        .attr("y2", y(avg - sd))

}


export function updateWeekdayBarChart(filtered_data_weekday) {

    var weekday_group = d3.nest()
    .key(function(d) { return d.weekday; })
    .rollup(function(d) { return d.length})
    .map(filtered_data_weekday)

    weekday_group = weekday_group.entries().sort(function(x, y){ return d3.ascending(+x.key, +y.key);})

    var height = 155

    var y = d3.scaleLinear()
    .domain([0, d3.max(weekday_group.map(d => d.value))])
    .range([ height, 0]);

    d3.select(".crossfilter2")
    .select(".axis.y")
    .transition()
    .duration(1000)
    .call(d3.axisLeft(y).ticks(5))

    var bars = d3.select(".crossfilter2")
            .select("svg")
            .selectAll(".bar")
            .data(weekday_group, d => d.key)

    bars.transition()
    .duration(1000)
    .attr("y", function(d) { return y(d.value); })
    .attr("height", function(d) { return height - y(d.value); })
    .attr("count", function(d) { return d.value})

    bars.exit()
    .transition()
    .duration(1000)
    .attr("y", function(d) {return height})
    .attr("height", function(d) { return 0 })
    .attr("count", function(d) { return 0})

    var values = weekday_group.map(x => x.value)
    var avg = (values.reduce((a, b) => a + b, 0) / values.length) || 0
    var sd = Math.sqrt(values.map(x => Math.pow(x - avg, 2)).reduce((a, b) => a + b) / values.length)

    d3.select(".avg-line.weekday")
        .transition()
        .duration(1000)
        .attr("y1", y(avg))
        .attr("y2", y(avg))

        d3.select(".sdup.weekday")
        .transition()
        .duration(1000)
        .attr("y1", y(avg + sd))
        .attr("y2", y(avg + sd))

        d3.select(".sddown.weekday")
        .transition()
        .duration(1000)
        .attr("y1", y(avg - sd))
        .attr("y2", y(avg - sd))

}


export function updateMonthBarChart(filtered_data_month) {
    
    var month_group = d3.nest()
    .key(function(d) { return d.month; })
    .rollup(function(d) { return d.length})
    .map(filtered_data_month)

    month_group = month_group.entries().sort(function(x, y){ return d3.ascending(+x.key, +y.key);})
    
    var height = 155
    
    var y = d3.scaleLinear()
    .domain([0, d3.max(month_group.map(d => d.value))])
    .range([ height, 0]);

    d3.select(".crossfilter3")
    .select(".axis.y")
    .transition()
    .duration(1000)
    .call(d3.axisLeft(y).ticks(5))

    var bars = d3.select(".crossfilter3")
            .select("svg")
            .selectAll(".bar")
            .data(month_group, d => d.key)

    bars.transition()
    .duration(1000)
    .attr("y", function(d) { return y(d.value); })
    .attr("height", function(d) { return height - y(d.value); })
    .attr("count", function(d) { return d.value})

    bars.exit()
    .transition()
    .duration(1000)
    .attr("y", function(d) {return height})
    .attr("height", function(d) { return 0 })
    .attr("count", function(d) { return 0})

    var values = month_group.map(x => x.value)
    var avg = (values.reduce((a, b) => a + b, 0) / values.length) || 0
    var sd = Math.sqrt(values.map(x => Math.pow(x - avg, 2)).reduce((a, b) => a + b) / values.length)

    d3.select(".avg-line.month")
        .transition()
        .duration(1000)
        .attr("y1", y(avg))
        .attr("y2", y(avg))

        d3.select(".sdup.month")
        .transition()
        .duration(1000)
        .attr("y1", y(avg + sd))
        .attr("y2", y(avg + sd))

        d3.select(".sddown.month")
        .transition()
        .duration(1000)
        .attr("y1", y(avg - sd))
        .attr("y2", y(avg - sd))
}