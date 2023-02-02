export function drawLineChart(data) {

var margin = {top: 20, right: 20, bottom: 110, left: 50},
    margin2 = {top: 330, right: 20, bottom: 30, left: 50}

var svg = d3.select(".tbd").append("svg").attr("width", "550").attr("height", "400")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    height2 = +svg.attr("height") - margin2.top - margin2.bottom;

var month_verbose = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"]

var parseDate = d3.timeParse("%d/%m/%Y");


var x = d3.scaleTime().range([0, width]),
    x2 = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    y2 = d3.scaleLinear().range([height2, 0]);

var xAxis = d3.axisBottom(x),
    xAxis2 = d3.axisBottom(x2),
    yAxis = d3.axisLeft(y);

var brush = d3.brushX()
    .extent([[0, 0], [width, height2]])
    .on("brush end", brushed);

var zoom = d3.zoom()
    .scaleExtent([1, Infinity])
    .translateExtent([[0, 0], [width, height]])
    .extent([[0, 0], [width, height]])
    .on("zoom", zoomed)
    .on("end", endzoom)

    var line = d3.line()
        .x(function (d) { return x(d.key); })
        .y(function (d) { return y(d.value); });

    var line2 = d3.line()
        .x(function (d) { return x2(d.key); })
        .y(function (d) { return y2(d.value); });

    var clip = svg.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", width)
        .attr("height", height)
        .attr("x", 0)
        .attr("y", 0);

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width/2 + 25)
        .attr("y", height + margin.top + 30)
        .style("font-size", "12px") 
        .style("fill", "white")
        .style("stroke", "none") 
        .text("time");

    svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", 13) 
        .attr("x", - 130)
        .text("Y axis title")
        .style("font-size", "10px") 
        .style("fill", "white")
        .style("stroke", "none") 
        .text("accident count");


    var Line_chart = svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("clip-path", "url(#clip)");


    var focus = svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var context = svg.append("g")
    .attr("class", "context interactor")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");


  var group_by_day = d3.nest()
        .key(function(d) { return d.timemonth})
        .rollup(function(d) { return d.length})
        .map(data)
        .entries()

  group_by_day.forEach(function(d, i) {
        d.key = new Date(d.key)
  })

  group_by_day = group_by_day.sort(function(a, b){ return d3.ascending(a.key, b.key); })

  var bisectDate = d3.bisector(function(d) { return d.key; }).left

  var pointer = svg.append("g")
  .attr("class", "pointer")
  .style("display", "none");

  pointer.append("circle")
        .attr("r", 4.5)
        .attr("fill", "none")
        .style("stroke", "#86D0CC")
        .style("stroke-width", "2");

  x.domain([d3.min(group_by_day.map(a => a.key)), d3.max(group_by_day.map(a => a.key))])
  y.domain([0, d3.max(group_by_day.map(a => a.value))])

  localStorage.setItem("ydomain", y.domain())

  x2.domain(x.domain());
  y2.domain(y.domain());


    focus.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    focus.append("g")
        .attr("class", "axis axis--y")
        .call(yAxis.ticks(7));

    Line_chart.append("path")
        .datum(group_by_day)
        .attr("class", "line")
        .style("stroke", "#86D0CC")
        .style("stroke-width", "1.5")
        .attr("d", line);

    context.append("path")
        .datum(group_by_day)
        .attr("class", "line")
        .style("stroke", "#86D0CC")
        .style("stroke-width", "1")
        .attr("d", line2);


  context.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height2 + ")")
      .call(xAxis2);

  context.append("g")
      .attr("class", "brush")
      .call(brush)
      .call(brush.move, x.range());

  svg.append("rect")
      .attr("class", "zoom interactor")
      .attr("width", width)
      .attr("height", height)
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .call(zoom);

  d3.select(".tbd")
    .select(".zoom")
        .on("mouseover", pointer_mouseover)
        .on("mouseout", pointer_mouseout)
        .on("mousemove", pointer_mousemove);


    var tooltip = d3.select(".tbd").append("div") 
        .attr("class", "tooltip")               
        .style("opacity", 0);

    var commaFormat = d3.format(',')


function brushed() {
  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
  var s = d3.event.selection || x2.range();
  x.domain(s.map(x2.invert, x2));
  y.domain(localStorage.getItem("ydomain").split(","))
  Line_chart.select(".line").attr("d", line);
  focus.select(".axis--x").call(xAxis);
  svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
      .scale(width / (s[1] - s[0]))
      .translate(-s[0], 0));
  localStorage.setItem("x", x.domain())
}


function zoomed() {
  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return;
  var t = d3.event.transform;
  x.domain(t.rescaleX(x2).domain());
  y.domain(localStorage.getItem("ydomain").split(","))
  Line_chart.select(".line").attr("d", line);
  focus.select(".axis--x").call(xAxis);
  context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
  localStorage.setItem("x", x.domain())
}

function endzoom() {
    if (!d3.event.sourceEvent) {
        d3.select(".tbd")
            .dispatch("filter_event")
    }
    else { if (!(d3.event.sourceEvent.type == "brush")) {
        d3.select(".tbd")
            .dispatch("filter_event")
        }
    }
}

function pointer_mouseover() {
    pointer.style("display", null)
}

function pointer_mouseout() {
    pointer.style("display", "none")
    tooltip.style("opacity", "0")
}
  

function pointer_mousemove() {
    var x0 = x.invert(d3.mouse(this)[0]),
        i = bisectDate(group_by_day, x0, 1),
        d0 = group_by_day[i - 1],
        d1 = group_by_day[i],
        d = x0 - d0.key > d1.key - x0 ? d1 : d0;
    pointer.attr("transform", "translate(" + (x(d.key) + margin.left) + "," + (y(d.value) + margin.top) + ")")
    
    tooltip
        .transition()
        .duration(500)
        .style("opacity", .9);

    var matrix = d3.select("circle").node().getScreenCTM()

    tooltip.html("date: " + month_verbose[d.key.getMonth()] + " " + d.key.getFullYear() + "<br>"
                 + "count: " + commaFormat(d.value))
        .style("left", (matrix.e) + "px")		
        .style("top", (matrix.f - 45) + "px");

  }


}


export function updateLineChart(filtered_data_time, context_dom) {

    var group_by_month_year = d3.nest()
    .key(function(d) { return d.timemonth})
    .rollup(function(d) { return d.length})
    .map(filtered_data_time)
    .entries()

    group_by_month_year.forEach(function(d, i) {
        d.key = new Date(d.key)
    })

    group_by_month_year = group_by_month_year.sort(function(a, b){ return d3.ascending(a.key, b.key); })

    var max_date = new Date(context_dom[1])
    max_date = new Date(max_date.setMonth(max_date.getMonth() + 1))

    var all_months = d3.timeMonth.range(context_dom[0], max_date).map(x => ({key: x, value: 0}))
    all_months.forEach(function(d,i) {
        var index = group_by_month_year.findIndex(function(e) {
            return e.key.getTime() == d.key.getTime()
          });
        
        if (!(index == -1)) {
            d.value = group_by_month_year[index].value
        }
    })

    group_by_month_year = all_months

    var width = 480,   //da modificare
        height = 270,
        height2 = 40,
        x = d3.scaleTime().range([0, width]),
        y = d3.scaleLinear().range([height, 0]),
        x2 = d3.scaleTime().range([0, width]),
        y2 = d3.scaleLinear().range([height2, 0]),
        yAxis = d3.axisLeft(y)

    var x_domain = localStorage.getItem("x").split(",").map(x => new Date(x))

    x.domain(x_domain)
    x2.domain(context_dom)
    y.domain([0, d3.max(group_by_month_year.map(a => a.value))])
    y2.domain(y.domain())

    localStorage.setItem("ydomain", y.domain())

    var line = d3.line()
        .x(function (d) { return x(d.key); })
        .y(function (d) { return y(d.value); });

    var line2 = d3.line()
        .x(function (d) { return x2(d.key); })
        .y(function (d) { return y2(d.value); });


    d3.select(".tbd")
    .select(".axis--y")
    .transition()
    .duration(1000)
    .call(yAxis.ticks(7))

    var line_chart = d3.select(".tbd")
                        .select(".focus")
                        .select("path")

    var context = d3.select(".tbd")
                        .select(".context")
                        .select("path")



    line_chart
        .datum(group_by_month_year)
        .transition()
        .duration(1000)
        .attr("d", line);

    context
        .datum(group_by_month_year)
        .transition()
        .duration(1000)
        .attr("d", line2);

    var pointer = d3.select(".tbd")
                    .select(".pointer")

    var tooltip = d3.select(".tbd")
                    .select(".tooltip")

    var commaFormat = d3.format(',')

    var month_verbose = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"]

    var bisectDate = d3.bisector(function(d) { return d.key; }).left

    d3.select(".tbd")
        .select(".zoom")
            .on("mouseover", function() { pointer.style("display", null); })
            .on("mouseout", function() {
                pointer.style("display", "none");
                tooltip.style("opacity", "0")
            })
            .on("mousemove", mousemove);


function mousemove() {
    var x_domain_point = localStorage.getItem("x").split(",").map(x => new Date(x))
    x.domain(x_domain_point)
    var x0 = x.invert(d3.mouse(this)[0]),
        i = bisectDate(group_by_month_year, x0, 1),
        d0 = group_by_month_year[i - 1],
        d1 = group_by_month_year[i],
        d = x0 - d0.key > d1.key - x0 ? d1 : d0;
    pointer.attr("transform", "translate(" + (x(d.key) + 50) + "," + (y(d.value) + 20) + ")");   // 40 and 20 to be substituted by margins

    tooltip
    .transition()
    .duration(500)
    .style("opacity", .9);

    var matrix = d3.select("circle").node().getScreenCTM()

    tooltip.html("date: " + month_verbose[d.key.getMonth()] + " " + d.key.getFullYear() + "<br>"
             + "count: " + commaFormat(d.value))
    .style("left", (matrix.e) + "px")		
    .style("top", (matrix.f -45) + "px");


    }


}