var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 640 - margin.left - margin.right,
    height = 333 - margin.top - margin.bottom;

var x = d3.scale.linear()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var color = d3.scale.category10();

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickSize(0)
    ;

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickSize(0)
    ;

var level = "Defaults";

var lendSvg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.json("static/data/lendingClub.json", function(error, fulldata) {
  var data = fulldata.Defaults;

  var formatAsPercent = d3.format(".0%");
  yAxis.tickFormat(formatAsPercent);
  var grade = ['A','B','C','D','E','F','G']
  var legendVals = d3.scale.ordinal()
    .range(grade)
    ;

  function formatCredit(g) {
    if (g < 5){
      return 'A';
    } 
    else if (g < 10){
      return 'B';
    }
    else if (g < 15){
      return 'C';
    }
    else if (g < 20){
      return 'D';
    }
    else if (g < 25){
      return 'E';
    }
    else if (g < 30){
      return 'F';
    }
    else if (g < 35){
      return 'G';
    }
    else {
      return '';
    }
  }
  xAxis.tickFormat(formatCredit)
    .tickSize(1)
    ; 


  x.domain([0,d3.max(data, function(d) {return d.id})]);
  y.domain([0,d3.max(data, function(d) {return d.value})]);


  lendSvg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Credit Grade");

  lendSvg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Default Rate")

  lendSvg.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 10)
      .attr("cx",width/200)
      .attr("cy",height)
      .style("opacity",0.1)
      .style("fill", function(d) { return color(d.name[0]); });

  lendSvg.selectAll(".dot").transition().duration(1000)
      .attr("r",3.5)
      .attr("cx", function(d) { return x(d.id); })
      .attr("cy", function(d) { return y(d.value); })
      .style("opacity",0.75)
      

  var lendLegend = lendSvg.selectAll(".legend")
      .data(color.domain())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  lendLegend.append("rect").transition().duration(1000)
      .attr("x", 36)
      .attr("width", 16)
      .attr("height", 16)
      .style("fill", color)
      .style("opacity",.75);

  lendLegend.append("text")
      .attr("x", 40.5)
      .attr("y", 8)
      .attr("dy", ".35em")
      .style("text-anchor", "begin")
      .style("fill",'#FFFFFF')
      .style("font-size", "10px")
      .text(legendVals)
      ;


});
