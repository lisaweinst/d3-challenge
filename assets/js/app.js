//set svg dimensions to be used later
var svgWidth = 960;
var svgHeight = 600;



//set borders for the SVG
var margin = {
    top: 20,
    right: 40,
    bottom: 150,
    left: 100
};


//create the width and height using the margins and parameters
const width = svgWidth - margin.right - margin.left;
const height = svgHeight - margin.top - margin.bottom;

//append a div classed chart to the scatter element
// var chart = d3.select("#scatter").append("div").classed("chart", true);

const svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight + 40); 
  

// get svg group
const chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

//initial Parameters
let currentXAxis = "poverty";
let currentYAxis = "healthcare";

//function used for updating x-scale var upon clicking on axis label
function xScale(censusData, currentXAxis) {
    //create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[currentXAxis]) * 0.8,
            d3.max(censusData, d => d[currentXAxis]) * 1.2
        ])
        .range([0, width]);

    return xLinearScale;
}

//function used for updating y-scale var upon clicking on axis label
function yScale(censusData, currentYAxis) {
    //create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[currentYAxis]) * 0.8,
            d3.max(censusData, d => d[currentYAxis]) * 1.2
        ])
        .range([height, 0]);

    return yLinearScale;
}

//function used for updating xAxis var upon click on axis label
function renderAxesX(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

//function used for updating yAxis var upon click on axis label
function renderAxesY(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

//function used for updating circles group with a transition to new circles
//for change in x axis or y axis
function renderCircles(circlesGroup, newXScale, currentXAxis, newYScale, currentYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", data => newXScale(data[currentXAxis]))
        .attr("cy", data => newYScale(data[currentYAxis]));

    return circlesGroup;
}

//function used for updating state labels with a transition to new 
function renderText(textGroup, newXScale, currentXAxis, newYScale, currentYAxis) {

    textGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[currentXAxis]))
        .attr("y", d => newYScale(d[currentYAxis]));

    return textGroup;
}
//function to stylize x-axis values for tooltips
function styleX(value, currentXAxis) {

    //stylize based on variable chosen
    //poverty percentage
    if (currentXAxis === 'poverty') {
        return `${value}%`;
    }
    //household income in dollars
    else if (currentXAxis === 'income') {
        return `$${value}`;
    }
    //age (number)
    else {
        return `${value}`;
    }
}

// function used for updating circles group with new tooltip
function updateToolTip(currentXAxis, currentYAxis, circlesGroup) {

    //select x label
    //poverty percentage
    if (currentXAxis === 'poverty') {
        var xLabel = "Poverty:";
    }
    //household income in dollars
    else if (currentXAxis === 'income') {
        var xLabel = "Median Income:";
    }
    //age (number)
    else {
        var xLabel = "Age:";
    }

    //select y label
    //percentage lacking healthcare
    if (currentYAxis === 'healthcare') {
        var yLabel = "No Healthcare:"
    }
    //percentage obese
    else if (currentYAxis === 'obesity') {
        var yLabel = "Obesity:"
    }
    //smoking percentage
    else {
        var yLabel = "Smokers:"
    }


    return circlesGroup;
}

//retrieve csv data and execute everything below
d3.csv("./assets/data/data.csv").then(function(censusData) {

    console.log(censusData);

    //parse data
    censusData.forEach(function(data) {
        data.obesity = +data.obesity;
        data.income = +data.income;
        data.smokes = +data.smokes;
        data.age = +data.age;
        data.healthcare = +data.healthcare;
        data.poverty = +data.poverty;
    });

    //create first linear scales
    var xLinearScale = xScale(censusData, currentXAxis);
    var yLinearScale = yScale(censusData, currentYAxis);

    //create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    //add data to the x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    //append y axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    //append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(censusData)
        .enter()
        .append("circle")
        .classed("stateCircle", true)
        .attr("cx", d => xLinearScale(d[currentXAxis]))
        .attr("cy", d => yLinearScale(d[currentYAxis]))
        .attr("r", 12)
        .attr("opacity", ".5");

    //append initial text
    var textGroup = chartGroup.selectAll(".stateText")
        .data(censusData)
        .enter()
        .append("text")
        .classed("stateText", true)
        .attr("x", d => xLinearScale(d[currentXAxis]))
        .attr("y", d => yLinearScale(d[currentYAxis]))
        .attr("dy", 3)
        .attr("font-size", "10px")
        .text(function(d) { return d.abbr });

    //create group for 3 x-axis labels
    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20 + margin.top})`);

    var povertyLabel = xLabelsGroup.append("text")
        .classed("aText", true)
        .classed("active", true)
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .text("In Poverty (%)");

    var ageLabel = xLabelsGroup.append("text")
        .classed("aText", true)
        .classed("inactive", true)
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .text("Age (Median)")

    var incomeLabel = xLabelsGroup.append("text")
        .classed("aText", true)
        .classed("inactive", true)
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income")
        .text("Household Income (Median)")

    //create group for 3 y-axis labels
    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${0 - margin.left/4}, ${(height/2)})`);

    const healthcareLabel = yLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 0 - 20)
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .attr("value", "healthcare")
        .text("Lacks Healthcare (%)")
        .classed("active", true);

    const smokesLabel = yLabelsGroup.append("text")
        .classed("aText", true)
        .attr("x", 0)
        .attr("y", 0 - 40)
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .attr("value", "smokes")
        .text("Smokes (%)")
        .classed("inactive", true);
     
     //grabbing the event   
    const obeseLabel = ylabelsGroup.append("text")
    	.attr("transform", "rotate(-90)")
    	.attr("x", -(height / 2))
    	.attr("y", -80)
    	.attr("value", "obesity") 
    	.attr("dy", "1em")
    	.text("Obese (%)")
    	.classed("inactive", true);

    //updateToolTip function with data
    var circlesXY= updateToolTip(currentXAxis, currentYAxis, circlesXY);

    //x axis labels event listener
    xLabelsGroup.selectAll("text")
        .on("click", function() {
            //get value of selection
            var value = d3.select(this).attr("value");

            //check if value is same as current axis
            if (value != currentXAxis) {

                //replace with new xvalue
                currentXAxis = value;

                //update x scale for new data
                xLinearScale = xScale(censusData, currentXAxis);

                //update x axis with transition
                xAxis = renderAxesX(xLinearScale, xAxis);

                //update circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, currentXAxis, yLinearScale, currentYAxis);

                //update text with new x values
                textGroup = renderText(textGroup, xLinearScale, currentXAxis, yLinearScale, currentYAxis);

                //update tooltips with new info
                circlesGroup = updateToolTip(currentXAxis, currentYAxis, circlesGroup);

                //change classes to change bold text
                if (currentXAxis === "poverty") {
                    povertyLabel.classed("active", true).classed("inactive", false);
                    ageLabel.classed("active", false).classed("inactive", true);
                    incomeLabel.classed("active", false).classed("inactive", true);
                } else if (currentXAxis === "age") {
                    povertyLabel.classed("active", false).classed("inactive", true);
                    ageLabel.classed("active", true).classed("inactive", false);
                    incomeLabel.classed("active", false).classed("inactive", true);
                } else {
                    povertyLabel.classed("active", false).classed("inactive", true);
                    ageLabel.classed("active", false).classed("inactive", true);
                    incomeLabel.classed("active", true).classed("inactive", false);
                }
            }
        });

    //y axis labels event listener
    yLabelsGroup.selectAll("text")
        .on("click", function() {
            //get value of selection
            var value = d3.select(this).attr("value");
            //check if value is same as current axis
            if (value != currentYAxis) {

                //replace new value
                currentYAxis = value;

                //update y scale for new data
                yLinearScale = yScale(censusData, currentYAxis);

                //update x axis with transition
                yAxis = renderAxesY(yLinearScale, yAxis);

                //update circles with new y values
                circlesXY = renderCircles(circlesXY, xLinearScale, currentXAxis, yLinearScale, currentYAxis);

                //update text with new y values
                textGroup = renderText(textGroup, xLinearScale, currentXAxis, yLinearScale, currentYAxis)

                //update tooltips with new info
                circlesXY = updateToolTip(currentXAxis, currentYAxis, circlesXY);

                //change classes to change bold text
                if (currentYAxis === "obesity") {
                    obesityLabel.classed("active", true).classed("inactive", false);
                    smokesLabel.classed("active", false).classed("inactive", true);
                    healthcareLabel.classed("active", false).classed("inactive", true);
                } else if (currentYAxis === "smokes") {
                    obesityLabel.classed("active", false).classed("inactive", true);
                    smokesLabel.classed("active", true).classed("inactive", false);
                    healthcareLabel.classed("active", false).classed("inactive", true);
                } else {
                    obesityLabel.classed("active", false).classed("inactive", true);
                    smokesLabel.classed("active", false).classed("inactive", true);
                    healthcareLabel.classed("active", true).classed("inactive", false);
                }
            }
        });




});