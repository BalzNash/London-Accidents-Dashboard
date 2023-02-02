export function drawIndicators(accidents) {
    var accident_count = accidents.length
    
    var fatalities_count = accidents.filter(function(d) {
        if (1 >= d["Accident_Severity"]) {
        return d}
        }).length

    var fatalities_per_100_crashes = Math.round(((fatalities_count / accident_count) * 1000) * 100) / 100

    var average_severity = 4 - Math.round(d3.sum(accidents.map(function(d){ return d.Accident_Severity})) / accidents.length * 100) / 100

    var text = d3.select("#counter-value")
        .append()
        .text(accident_count)
        .attr("class", "accident-count")

    var text = d3.select("#counter-value2")
        .append()
        .text(fatalities_per_100_crashes)
        .attr("class", "accident-count2")

    var text = d3.select("#counter-value3")
        .append()
        .text(average_severity)
        .attr("class", "accident-count3")
    
}

export function updateIndicators(accidents) {
    d3.select(".accident-count")
    .transition()
    .tween("text", function() {
        var selection = d3.select(this);    // selection of node being transitioned
        var start = parseInt(d3.select(this).text()); // start value prior to transition
        console.log(start)
        var end = accidents.length;                     // specified end value
        var interpolator = d3.interpolateNumber(start,end); // d3 interpolator
   
        return function(t) { selection.text(Math.round(interpolator(t))); };  // return value
    })
    .duration(1000);

    d3.select(".accident-count2")
    .transition()
    .tween("text", function() {
        var selection = d3.select(this);    // selection of node being transitioned
        var start = d3.select(this).text(); // start value prior to transition
        var fatalities_count = accidents.filter(function(d) {
            if (1 >= d["Accident_Severity"]) {
            return d}
            }).length

        console.log(fatalities_count)
        console.log(accidents.length)
        
        var fatalities_per_100_crashes = Math.round(((fatalities_count / accidents.length) * 1000) * 100) / 100

        var end = fatalities_per_100_crashes;                     // specified end value
        var interpolator = d3.interpolateNumber(start,end); // d3 interpolator
    
        return function(t) { selection.text(interpolator(t)); };  // return value
    })
    .duration(1000);

    d3.select(".accident-count3")
    .transition()
    .tween("text", function() {
        var selection = d3.select(this);    // selection of node being transitioned
        var start = d3.select(this).text(); // start value prior to transition
        var end = 4 - Math.round(d3.sum(accidents.map(function(d){ return d.Accident_Severity})) / accidents.length * 100) / 100                    // specified end value
        var interpolator = d3.interpolateNumber(start,end); // d3 interpolator
    
        return function(t) { selection.text(interpolator(t)); };  // return value
    })
    .duration(1000);


}
    