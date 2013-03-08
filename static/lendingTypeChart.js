var margin = {top: 20, right: 40, bottom: 30, left: 20},
    width = 640 - margin.left - margin.right,
    height = 333 - margin.top - margin.bottom,
    barWidth = Math.floor(width / 36) - 1;

var color = d3.scale.ordinal()
  .domain([0,1,2])
  .range(['#F7776D','#1f77b4','#F7776D'])
  ;

var x = d3.scale.linear()
    .range([barWidth / 2, width - barWidth / 2]);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickValues([1,8,15,22,29,36])
    ;
var yAxis = d3.svg.axis()
    .scale(y)
    .orient("right")
    .tickSize(-width)
    //.tickFormat(function(d) { return Math.round(d / 1e3) + "Thousand"; });
    //.tickFormat(function(d) { return Math.round(d / 1e3) + "Thousand"; });
    
// An SVG element with a bottom-right origin.
var barsvg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// A sliding container to hold the bars by birthyear.
var birthyears = barsvg.append("g")
    .attr("class", "birthyears");

// A label for the current year.
var title = barsvg.append("text")
    .attr("class", "title")
    .attr("dy", ".71em")
    .text("Loans by Status");

//define some variables I hope to see later
var labels, type, label, labelKeys, funding, ddKeys;

d3.csv("/static/data/lendingClubBar.csv", function(error, data) {
  
  // creates a distinct list of descriptions for the legend
  labels = d3.nest()
      .key(function(d) { return d.type; })
      .key(function(d) { return d.cat_name; })
      .map(data);

  // creates a distinct list of issue dates
  var dd = d3.nest()
      //.key(function(d) { return d.type; })
      .key(function(d) { return d.issue_date; })
      .map(data);
    ddKeys = d3.keys(dd);
    funding = d3.scale.ordinal()
      .domain([0,ddKeys.length])
      .range(ddKeys);    

  function formatIssue(g) {
    return ddKeys[g-1];
  }

  xAxis.tickFormat(formatIssue)
    .tickSize(0)
    ;
  // Convert strings to numbers.
  data.forEach(function(d) {
    d.count = +d.count;
    d.id = +d.id;
    d.month_age = +d.month_age;
  });

  // Compute the extent of the data set in age and years.
  var month_age1 = d3.max(data, function(d) { return d.month_age; }),
      type0 = d3.min(data, function(d) { return d.type; }),
      type1 = d3.max(data, function(d) { return d.type; });
      type = type1;

  // Update the scale domains.
  x.domain([0,36]);
  y.domain([0, d3.max(data, function(d) { return d.count; })]);

  // Produce a map from year and birthyear to [male, female].
  data = d3.nest()
      .key(function(d) { return d.type; })
      .key(function(d) { return d.month_age; })
      .rollup(function(v) { return v.map(function(d) { return d.count; }); })
      .map(data);

  // Add an axis to show the population values.
  barsvg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + width + ",0)")
      .call(yAxis)
    .selectAll("g")
    .filter(function(value) { return !value; })
      .classed("major", true);

  // Add the x axis
  barsvg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width/2)
      .attr("y", 26)
      .style("text-anchor", "middle")
      .text("Issue Date");


  // Add labeled rects for each birthyear (so that no enter or exit is required).
  var birthyear = birthyears.selectAll(".birthyear")
      .data(d3.range(0, month_age1 + 1, 1))
    .enter().append("g")
      .attr("class", "birthyear")
      .attr("transform", function(birthyear) { return "translate(" + x(birthyear) + ",0)"; });

  birthyear.selectAll("rect")
      .data(function(birthyear) { return data[type][birthyear] || [0, 0]; })
    .enter().append("rect")
      .attr("x", -barWidth / 2)
      .attr("width", barWidth)
      .attr("y", y)
      .attr("height", function(value) { return height - y(value); });

  // Add labels to show birthyear.
  birthyear.append("text")
      .attr("y", height - 4)
      .style("font",'4px')
      .text(function(birthyear) { return birthyear; });

  // Add labels to show age (separate; not animated).
  /*barsvg.selectAll(".age")
      .data(d3.range(0, month_age1 + 1, 5))
    .enter().append("text")
      .attr("class", "month_age")
      .attr("x", function(month_age) { return x(month_age); })
      .attr("y", height + 4)
      .attr("dy", ".71em")
      .text(function(month_age) { return month_age; });*/

  // Adds a lengend to tell what is going on
  labelKeys = d3.keys(labels[type])
  label = d3.scale.ordinal()
    .domain([0,labelKeys.length])
    .range(labelKeys);

  var lendLegend = barsvg.selectAll(".legend")
      .data(label.range())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  lendLegend.append("rect").transition().duration(1000)
      .attr("x", 410)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color)
      .style("opacity",.75);

  lendLegend.append("text").transition()
        .duration(750)
      .attr("x", 430.5)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "begin")
      .style("fill",'#333')
      .text(label)
      ;
  // Allow the arrow keys to change the displayed year.
  window.focus();
  d3.select(window).on("keydown", function() {
    switch (d3.event.keyCode) {
      case 37: type = type0; break;
      case 39: type = type1; break;
    }
    update();
  });

  function update() {
    if (!(type in data)) return;
    title.text(type);

    birthyears.transition()
        .duration(750)
        .attr("transform", "translate(" + (x(type1) - x(type)) + ",0)");

    birthyear.selectAll("rect")
        .data(function(birthyear) { return data[type][birthyear] || [0, 0]; })
      .transition()
        .duration(750)
        .attr("y", y)
        .attr("height", function(value) { return height - y(value); });


    labelKeys = d3.keys(labels[type])
    label = d3.scale.ordinal()
        .domain([0,labelKeys.length])
        .range(labelKeys);

    lendLegend.select("text").transition()
        .duration(750)
        .attr("x", 430.5)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "begin")
        .style("fill",'#333')
        .text(label)
        .style("opacity",1)
       ;
  }


});

