import { filterData } from './filtering.js';
import { updateMap } from './map.js';
import { updateHourBarchart, updateWeekdayBarChart, updateMonthBarChart } from './barcharts.js';
import { updateMatrixChart } from './matrix_chart.js';
import { updateLineChart } from './linechart.js';
import { updateIndicators } from './indicators.js';
import { update_pca_colors } from './pca.js';

export function addInteraction(data, filters, selection_mode, context_dom) {

    ///////////////////////////////////
    ////////////// MAP ////////////////
    ///////////////////////////////////

    d3.selectAll(".borough")
            .on("click", mapMouseClick)
    
    function mapMouseClick() {

        if (selection_mode["boroughs"] == 2) {
            selection_mode["boroughs"] = 0
        }
        else if (selection_mode["boroughs"] == 3) {
            selection_mode["boroughs"] = 1
        } else {

        var selection = d3.select(this),
            selected_bor = selection.attr("code")

        // if click to select single borough and remove others (e.g. first click)
        if (selection_mode["boroughs"] == 0) {
            filters["boroughs"] = []
            selection_mode["boroughs"] = 1
        }

        // if not already selected
        if (!(filters["boroughs"].includes(selected_bor))) {

            filters["boroughs"].push(selected_bor)
    
            selection
                .attr("selected", "true")
                .style("opacity", "0.8")

            d3.selectAll(".borough").each(function(d) {
                var all_selection = d3.select(this)
                if (!(all_selection.attr("selected") == "true")) {
                    all_selection.style("opacity", "0.1")
                }
            })

            // if already selected
        } else {
            var filter_index = filters["boroughs"].indexOf(selected_bor);
            filters["boroughs"].splice(filter_index, 1)

            selection
                .attr("selected", "false")
                .style("opacity", "0.1")
        }

        }
        // update data

        var filtered_data = filterData(data, filters)

        console.log(filtered_data.tot)
        console.log(filters)

        // update bars ///////////////////
        //////////////////////////////////

        updateHourBarchart(filtered_data.hour)
        updateWeekdayBarChart(filtered_data.weekday)
        updateMonthBarChart(filtered_data.month)

        // update matrix chart//////////////
        ////////////////////////////////////

        updateMatrixChart(filtered_data.matrix)

        // update linechart
        
        updateLineChart(filtered_data.time, context_dom)

        updateIndicators(filtered_data.tot)

        update_pca_colors(filters)
        
    }

    //////////////////////////////////////////
    ////////////////BARS//////////////////////
    //////////////////////////////////////////


    d3.selectAll(".bar")
        .on("click", barMouseClick)
  
    function barMouseClick() {

        var special_event = localStorage.getItem("bar-special-event")

        if (!(special_event == "false")) {
            if (selection_mode[special_event] == 2) {
                selection_mode[special_event] = 0
            }
            else if (selection_mode[special_event] == 3) {
                selection_mode[special_event] = 1
            }

            localStorage.setItem("bar-special-event", "false")
        }

        else {
        // update selected barchart and filters
        ///////////////////////////////////////

        var selection = d3.select(this)
        var plot_type = selection.attr("class").split(" ")[1]

        if (selection_mode[plot_type] == 0) {
            filters[plot_type] = []
            selection_mode[plot_type] = 1
        }

        // if bar is already selected, deselect
        if (selection.attr("selected") == "true") {   // see if it's better to check in the filters object
            
            selection.attr("selected", "false")
                        .style("opacity", "0.1")

            var filter_index = filters[plot_type].indexOf(parseInt(selection.attr("label")));
                filters[plot_type].splice(filter_index, 1)

        // if bar was not selected yet
        } else {
            selection
                .attr("selected", "true")
                .style("opacity", "1")

            filters[plot_type].push(parseInt(selection.attr("label")))

        // this can be optimized by executing it only the first time something is selected
            d3.selectAll(".bar." + plot_type).each(function(d) {
                var all_selection = d3.select(this)
                if (!(all_selection.attr("selected") == "true")) {
                        all_selection.style("opacity", "0.1")
                }
            })

        }

        }

        var filtered_data = filterData(data, filters)


        // update other barcharts //////////
        ////////////////////////////////////
        
        // update hour barchart
        if (!(plot_type == "hour")) {
            updateHourBarchart(filtered_data.hour)
        }
        // update weekday barchart
        if (!(plot_type == "weekday")) {
            updateWeekdayBarChart(filtered_data.weekday)
        }
        // update month barchart
        if (!(plot_type == "month")) {
            updateMonthBarChart(filtered_data.month)
        }

        // update map /////////////
        ///////////////////////////

        updateMap(filtered_data.borough)


        // update matrix chart ////
        ///////////////////////////

        updateMatrixChart(filtered_data.matrix)


        // update linechart//////////
        /////////////////////////////

        updateLineChart(filtered_data.time, context_dom)

        updateIndicators(filtered_data.tot)

    }


    //////////////////////////////////////
    ////////////LINE CHART////////////////
    //////////////////////////////////////

    d3.select(".tbd")
        .on("filter_event", lineChartFilter)


    function lineChartFilter() {

        // get new timerange and round the right bound to the start of the next month
        var current_timerange = localStorage.getItem("x").split(",").map(x => new Date(x))
        current_timerange[1].setMonth(current_timerange[1].getMonth() + 1)
        current_timerange[1].setDate(1)
        current_timerange[1].setHours(0,0,0)

        filters["timerange"] = current_timerange

        var filtered_data = filterData(data, filters)
        
        // update map /////////////
        ///////////////////////////

        updateMap(filtered_data.borough)

        
        // update bars ///////////////////
        //////////////////////////////////

        updateHourBarchart(filtered_data.hour)
        updateWeekdayBarChart(filtered_data.weekday)
        updateMonthBarChart(filtered_data.month)


        // update weekday-hour chart

        updateMatrixChart(filtered_data.matrix)

        updateIndicators(filtered_data.tot)

    }


    ///////////////////////////////////////
    ////////////////CHARTS MENU////////////
    ///////////////////////////////////////

    /////map////////////////
    ////////////////////////

    d3.select("#map-reset")
            .on("click", mapReset)

    d3.select("#map-selectall")
            .on("click", mapSelectAll)

    d3.select("#map-unselectall")
            .on("click", mapUnSelectAll)


    function mapReset() {
        selection_mode["boroughs"] = 2
        filters["boroughs"] = d3.set(data, function(d) {return d.Local_Authority_Highway}).values()

        d3.selectAll(".borough").each(function(d) {
            var borough = d3.select(this)
            borough.attr("selected", "false")
                    .style("opacity", "0.8")
            }
        )
        mapMouseClick()
    }

    function mapSelectAll() {
        selection_mode["boroughs"] = 3
        filters["boroughs"] = d3.set(data, function(d) {return d.Local_Authority_Highway}).values()

        d3.selectAll(".borough").each(function(d) {
            var borough = d3.select(this)
            borough.attr("selected", "true")
                    .style("opacity", "0.8")
            }
        )
        mapMouseClick()
    }

    function mapUnSelectAll() {
        selection_mode["boroughs"] = 2
        filters["boroughs"] = []

        d3.selectAll(".borough").each(function(d) {
            var borough = d3.select(this)
            borough.attr("selected", "false")
                    .style("opacity", "0.1")
            }
        )
        mapMouseClick()
    }


    //////bars////////////
    //////////////////////
    
    d3.select("#hourbar-reset")
            .on("click", hourBarReset)

    d3.select("#hourbar-selectall")
            .on("click", hourBarSelectAll)

    d3.select("#hourbar-unselectall")
            .on("click", hourBarUnSelectAll)

    d3.select("#weekdaybar-reset")
            .on("click", weekdayBarReset)

    d3.select("#weekdaybar-selectall")
            .on("click", weekdayBarSelectAll)

    d3.select("#weekdaybar-unselectall")
            .on("click", weekdayBarUnSelectAll)

    d3.select("#monthbar-reset")
            .on("click", monthBarReset)

    d3.select("#monthbar-selectall")
            .on("click", monthBarSelectAll)

    d3.select("#monthbar-unselectall")
            .on("click", monthBarUnSelectAll)


    //hour functions
    
    function hourBarReset() {
        selection_mode["hour"] = 2
        filters["hour"] = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]

        d3.selectAll(".bar.hour").each(function(d) {
            var bar = d3.select(this)
            bar.attr("selected", "false")
                    .style("opacity", "1")
            }
        )
        localStorage.setItem("bar-special-event", "hour")
        
        barMouseClick()
    }

    function hourBarSelectAll() {
        selection_mode["hour"] = 3
        filters["hour"] = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]

        d3.selectAll(".bar.hour").each(function(d) {
            var bar = d3.select(this)
            bar.attr("selected", "true")
                    .style("opacity", "1")
            }
        )
        localStorage.setItem("bar-special-event", "hour")
        
        barMouseClick()
    }

    function hourBarUnSelectAll() {
        selection_mode["hour"] = 2
        filters["hour"] = []

        d3.selectAll(".bar.hour").each(function(d) {
            var bar = d3.select(this)
            bar.attr("selected", "false")
                    .style("opacity", "0.1")
            }
        )
        localStorage.setItem("bar-special-event", "hour")

        barMouseClick()
    }

    // weekday functions

    function weekdayBarReset() {
        selection_mode["weekday"] = 2
        filters["weekday"] = [0,1,2,3,4,5,6]

        d3.selectAll(".bar.weekday").each(function(d) {
            var bar = d3.select(this)
            bar.attr("selected", "false")
                    .style("opacity", "1")
            }
        )
        localStorage.setItem("bar-special-event", "weekday")
        
        barMouseClick()
    }

    function weekdayBarSelectAll() {
        selection_mode["weekday"] = 3
        filters["weekday"] = [0,1,2,3,4,5,6]

        d3.selectAll(".bar.weekday").each(function(d) {
            var bar = d3.select(this)
            bar.attr("selected", "true")
                    .style("opacity", "1")
            }
        )
        localStorage.setItem("bar-special-event", "weekday")
        
        barMouseClick()
    }

    function weekdayBarUnSelectAll() {
        selection_mode["weekday"] = 2
        filters["weekday"] = []

        d3.selectAll(".bar.weekday").each(function(d) {
            var bar = d3.select(this)
            bar.attr("selected", "false")
                    .style("opacity", "0.1")
            }
        )
        localStorage.setItem("bar-special-event", "weekday")

        barMouseClick()
    }

    // month functions

    function monthBarReset() {
        selection_mode["month"] = 2
        filters["month"] = [0,1,2,3,4,5,6,7,8,9,10,11]

        d3.selectAll(".bar.month").each(function(d) {
            var bar = d3.select(this)
            bar.attr("selected", "false")
                    .style("opacity", "1")
            }
        )
        localStorage.setItem("bar-special-event", "month")
        
        barMouseClick()
    }

    function monthBarSelectAll() {
        selection_mode["month"] = 3
        filters["month"] = [0,1,2,3,4,5,6,7,8,9,10,11]

        d3.selectAll(".bar.month").each(function(d) {
            var bar = d3.select(this)
            bar.attr("selected", "true")
                    .style("opacity", "1")
            }
        )
        localStorage.setItem("bar-special-event", "month")
        
        barMouseClick()
    }

    function monthBarUnSelectAll() {
        selection_mode["month"] = 2
        filters["month"] = []

        d3.selectAll(".bar.month").each(function(d) {
            var bar = d3.select(this)
            bar.attr("selected", "false")
                    .style("opacity", "0.1")
            }
        )
        localStorage.setItem("bar-special-event", "month")

        barMouseClick()
    }

    //// reset all
    d3.select("#reset-all")
        .on("click", resetAll)
        
    function resetAll() {
        mapReset()
        hourBarReset()
        weekdayBarReset()
        monthBarReset()
        // is it possible to reset also the linechart?
    }

    d3.select("#fatal-only").on("change",updateFatal)
    
    function updateFatal(){
        if (d3.select("#fatal-only").property("checked")){
            filters["fatal-only"] = 1}
        else  {
            filters["fatal-only"] = 3
        }

        var filtered_data = filterData(data, filters)

        updateMap(filtered_data.borough)
        updateHourBarchart(filtered_data.hour)
        updateWeekdayBarChart(filtered_data.weekday)
        updateMonthBarChart(filtered_data.month)
        updateMatrixChart(filtered_data.matrix)
        updateLineChart(filtered_data.time, context_dom)
        updateIndicators(filtered_data.tot)
    
    }

    d3.select("#apply-filters").on("click",applyFilters)

    function applyFilters (){
        filters["speedlimit"] = []
        filters["weather"] = []
        filters["light-cond"] = []

        var speed_checkboxes = document.getElementsByClassName("speedlimit")
        for (let checkbox of speed_checkboxes) {
            if (checkbox.checked) {
                filters["speedlimit"].push(checkbox.value)
            }
        }

        var weather_checkboxes = document.getElementsByClassName("weather")
        for (let checkbox of weather_checkboxes) {
            if (checkbox.checked) {
                filters["weather"].push(checkbox.value)
            }
        }

        var light_checkboxes = document.getElementsByClassName("light-cond")
        for (let checkbox of light_checkboxes) {
            if (checkbox.checked) {
                filters["light-cond"].push(checkbox.value)
            }
        }

        var filtered_data = filterData(data, filters)


        updateMap(filtered_data.borough)
        updateHourBarchart(filtered_data.hour)
        updateWeekdayBarChart(filtered_data.weekday)
        updateMonthBarChart(filtered_data.month)
        updateMatrixChart(filtered_data.matrix)
        updateLineChart(filtered_data.time, context_dom)
        updateIndicators(filtered_data.tot)
    }

    d3.select("#apply-dimred").on("click",applyDimred)

    function applyDimred(){
        const url = 'http://localhost:5000/hello'
        const response = fetch(url, {
            method: 'POST',
            body: JSON.stringify(filters),
            headers: {
                'Content-Type': 'application/json'
            },
            referrer: 'no-referrer'
        })
                            .then(updateDimred)
    }
    
    function updateDimred() {
        d3.csv("./static/data/pca_updated.csv", function(updated_pca) {

            var circles = d3.selectAll("circle")
                            .remove()

            console.log(circles)

            var height = 305
            var width = 500

            var x = d3.scaleLinear()
                .domain([-3, 3])
                .range([ 0, width ]);

            // Add Y axis
            var y = d3.scaleLinear()
            .domain([-3, 3])
            .range([ height, 0]);

            var svg = d3.select('.dimred')
                    .select('svg')

            svg.select('g')
                .selectAll("dot")
                .data(updated_pca, d => d.Local_Authority_Highway)
                .enter()
                .append("circle")
                    .attr("cx", function (d) { return x(d.dim1); } )
                    .attr("cy", function (d) { return y(d.dim2); } )
                    .attr("r", 5)
                    .attr("label", function(d) { return d.Local_Authority_Highway})
                    .attr("name", function(d) { return d.name})
                    .attr("class", "circlepca")
                    .style("fill", "aquamarine")
                    .style("stroke", "white")

            svg.append("circle")//making a line for legend
                    .attr("cx", 15)
                    .attr("cy", -20)
                    .attr("r", 5)       
                    .style("fill", "#86D0CC")
                    .style("stroke", "white")

            var tooltip = d3.select(".dimred").append("div") 
            .attr("class", "tooltip")               
            .style("opacity", 0);
        
            var commaFormat = d3.format(',')
        
        
            d3.selectAll(".circlepca")
                .on("mouseover", circle_mouseover)
                .on("mouseleave", circle_mouseleave)
        
            function circle_mouseover() {
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
        
            function circle_mouseleave() {
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
    
        })
    }

}
