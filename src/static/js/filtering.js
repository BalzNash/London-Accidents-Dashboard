export function filterData(data, filters) {

    var filtered_data_borough = data.filter(function(d) {
        if (filters["hour"].includes(d["hour"])
            && filters["weekday"].includes(d["weekday"])
            && filters["month"].includes(d["month"])
            && filters["timerange"][0] <= d["Date"]
            && filters["timerange"][1] > d["Date"]
            && filters["fatal-only"] >= d["Accident_Severity"]
            && filters["speedlimit"].includes(d["Speed_limit"])
            && filters["weather"].includes(d["Weather_Conditions"])
            && filters["light-cond"].includes(d["Light_Conditions"])) {
        return d}
        })             

    var filtered_data_hour = data.filter(function(d) {
        if (filters["boroughs"].includes(d["Local_Authority_Highway"])
            && filters["weekday"].includes(d["weekday"])
            && filters["month"].includes(d["month"])
            && filters["timerange"][0] <= d["Date"]
            && filters["timerange"][1] > d["Date"]
            && filters["fatal-only"] >= d["Accident_Severity"]
            && filters["speedlimit"].includes(d["Speed_limit"])
            && filters["weather"].includes(d["Weather_Conditions"])
            && filters["light-cond"].includes(d["Light_Conditions"])) {
        return d}
        })

    var filtered_data_weekday = data.filter(function(d) {
        if (filters["boroughs"].includes(d["Local_Authority_Highway"])
            && filters["hour"].includes(d["hour"])
            && filters["month"].includes(d["month"])
            && filters["timerange"][0] <= d["Date"]
            && filters["timerange"][1] > d["Date"]
            && filters["fatal-only"] >= d["Accident_Severity"]
            && filters["speedlimit"].includes(d["Speed_limit"])
            && filters["weather"].includes(d["Weather_Conditions"])
            && filters["light-cond"].includes(d["Light_Conditions"])) {
        return d}
        })

    var filtered_data_month = data.filter(function(d) {
        if (filters["boroughs"].includes(d["Local_Authority_Highway"])
            && filters["hour"].includes(d["hour"])
            && filters["weekday"].includes(d["weekday"])
            && filters["timerange"][0] <= d["Date"]
            && filters["timerange"][1] > d["Date"]
            && filters["fatal-only"] >= d["Accident_Severity"]
            && filters["speedlimit"].includes(d["Speed_limit"])
            && filters["weather"].includes(d["Weather_Conditions"])
            && filters["light-cond"].includes(d["Light_Conditions"])) {
        return d}
        })

    var filtered_data_time = data.filter(function(d) {
        if (filters["boroughs"].includes(d["Local_Authority_Highway"])
            && filters["hour"].includes(d["hour"])
            && filters["weekday"].includes(d["weekday"])
            && filters["month"].includes(d["month"])
            && filters["fatal-only"] >= d["Accident_Severity"]
            && filters["speedlimit"].includes(d["Speed_limit"])
            && filters["weather"].includes(d["Weather_Conditions"])
            && filters["light-cond"].includes(d["Light_Conditions"])) {
        return d}
        })

    var filtered_data_matrix = data.filter(function(d) {
        if (filters["boroughs"].includes(d["Local_Authority_Highway"])
            && filters["month"].includes(d["month"])
            && filters["timerange"][0] <= d["Date"]
            && filters["timerange"][1] > d["Date"]
            && filters["fatal-only"] >= d["Accident_Severity"]
            && filters["speedlimit"].includes(d["Speed_limit"])
            && filters["weather"].includes(d["Weather_Conditions"])
            && filters["light-cond"].includes(d["Light_Conditions"])) {
                
        return d}
        })

    var filtered_data_tot = data.filter(function(d) {
        if (filters["boroughs"].includes(d["Local_Authority_Highway"])
            && filters["hour"].includes(d["hour"])
            && filters["weekday"].includes(d["weekday"])
            && filters["month"].includes(d["month"])
            && filters["timerange"][0] <= d["Date"]
            && filters["timerange"][1] > d["Date"]
            && filters["fatal-only"] >= d["Accident_Severity"]
            && filters["speedlimit"].includes(d["Speed_limit"])
            && filters["weather"].includes(d["Weather_Conditions"])
            && filters["light-cond"].includes(d["Light_Conditions"])) {
        return d}
        })             

    return {
        borough: filtered_data_borough,
        hour: filtered_data_hour,
        weekday: filtered_data_weekday,
        month: filtered_data_month,
        time: filtered_data_time,
        matrix: filtered_data_matrix,
        tot: filtered_data_tot
    }
}