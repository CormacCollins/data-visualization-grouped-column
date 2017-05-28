// ---------------------------------------------------------------------------------------------------//
//
//                                      LINE CHART VISUALIZATION 
//
// ---------------------------------------------------------------------------------------------------//


function LineChart(data, dataObject, colourScale){

    //Setup chart
    var svg = d3.select("#lineChart")
        margin = {top: 20, right: 20, bottom: 50, left: 50},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleLinear()
    	.rangeRound([0, width]);

    var y = d3.scaleLinear()
        .rangeRound([height, 0]);

    //map line function to correct variables
    var line = d3.line()
        .x(function(d){
            return x(d.TIME);
        })
        .y(function(d){
            return y(d.Value);
        });  

    //use extend to map highest and lowest TIME values (as it's not just 0 starting order)
    x.domain(d3.extent(data, function(d) {
        console.log(typeof(String(d.TIME))); 
        return  d.TIME; //String(d.TIME).slice(0, 1) + String(d.TIME).slice(2, 1) + String(d.TIME).slice(2, 4);  
    }));
    //map value range to y axis
    y.domain([0, d3.max(data, function(d){
        return d.Value;
    })]);

    
    tickArray = [];
    for(var i = 0; i < data.length; i++){
        tickArray.push(data[i].TIME);
    }

    var xAxis = d3.axisBottom(x)
        .ticks(data.length)
        .tickFormat(function(d){
            return String(d);
        });

                

    //add group translated 'down' to bottom of y to add the x-axis
    svg.append("g")
        .call(xAxis)
        .attr("transform", "translate(" + margin.left + "," + height + ")");

    g.append("g")
      .call(d3.axisLeft(y))
    .append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Spending%");

      color = 0;
      for(var key in dataObject){

            g.append("path")
            .datum(dataObject[key])
            .attr("fill", "none")
            .attr("stroke", colourScale(key))
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 3)
            .attr("d", line);

            color++;

      }

}