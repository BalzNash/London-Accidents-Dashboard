import { drawBarCharts } from './barcharts.js';
import { drawLineChart } from './linechart.js';
import { drawMap } from './map.js';
import { drawMatrixPlot } from './matrix_chart.js';
import { addInteraction } from './interactions.js';
import { drawIndicators } from './indicators.js';
import {drawPCA} from './pca.js'


var data = null,
    boroughs = null,
    filtered_data = null,
    filters = {
                  "boroughs": [],
                  "hour": [],
                  "weekday": [],
                  "month": [],
                  "timerange": [],
                  "fatal-only": 3,
                  "speedlimit": [],
                  "weather": []
              },
    selection_mode = {                      // defines selection behavior, 0: click adds selection and removes all other selections, 1: click adds/removes single selection
                  "boroughs": 0,         
                  "hour": 0,
                  "weekday": 0,
                  "month": 0
              }     

d3.queue()
    .defer(d3.csv, "./static/data/london_accidents.csv")
    .defer(d3.json, "./static/data/london_boroughs.json")
    .defer(d3.csv, "./static/data/pca_data.csv")
    .await(storeData)

function storeData(error, accidents, json, pca_data) {
    if (error) throw error;
    
    var parseDate = d3.timeParse("%d/%m/%Y");

    accidents.forEach((d, i) => {
      d.index = i;
      d.Date = parseDate(d.Date);
      d.hour = + d.Time.split(':')[0]
    });

    accidents.forEach((d, i) => {
      d.weekday = d.Date.getDay()
      d.month = d.Date.getMonth()
      d.timemonth = d3.timeMonth(d.Date)
    });

    data = accidents
    filtered_data = accidents
    boroughs = json

    filters["boroughs"] = d3.set(data, function(d) {return d.Local_Authority_Highway}).values()
    filters["hour"] = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]
    filters["weekday"] = [0,1,2,3,4,5,6]
    filters["month"] = [0,1,2,3,4,5,6,7,8,9,10,11]
    filters["speedlimit"] = ['10','15','20','30','40','50','60','70']
    filters["weather"] = ['1','2','3','4','5','6','7','8','9']
    filters["light-cond"] = ['1','4','5','6','7']

    localStorage.setItem("bar-special-event", "false")

      var group_by_day = d3.nest()
        .key(function(d) { return d.timemonth})
        .rollup(function(d) { return d.length})
        .map(data)
        .entries()

      group_by_day.forEach(function(d, i) {
          d.key = new Date(d.key)
      })

      group_by_day = group_by_day.sort(function(a, b){ return d3.ascending(a.key, b.key); })

      var context_dom = [d3.min(group_by_day.map(a => a.key)), d3.max(group_by_day.map(a => a.key))]
      var new_top = new Date(context_dom[1])
      var adjusted_timerange = [new Date(context_dom[0]), new Date(new_top.setMonth(new_top.getMonth() + 1))]
      filters["timerange"] = adjusted_timerange

    drawAll(data, boroughs, context_dom, pca_data)
};

function drawAll(data, boroughs, context_dom, pca_data) {

    drawBarCharts(data)
    drawMap(data, boroughs)
    drawMatrixPlot(data)
    drawLineChart(data)
    addInteraction(data, filters, selection_mode, context_dom)
    drawIndicators(data)
    drawPCA(pca_data)
};


  /*
  var hour_group = d3.nest()
    .key(function(d) { return d.hour; })
    .rollup(function(d){
      return d3.mean(d, function(g) { 
        return +g.Accident_Severity;
        });
      })
    .map(accidents)
*/