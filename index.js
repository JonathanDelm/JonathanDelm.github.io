// Tutorial: https://youtu.be/BDpBAFvdjYo
const data = [
  { name: "0-19", value: 63311, est: 10000 },
  { name: "20-29", value: 89634, est: 10000 },
  { name: "30-39", value: 82440, est: 10000 },
  { name: "40-49", value: 82030, est: 10000 },
  { name: "50-59", value: 76691, est: 10000 },
  { name: "60-69", value: 43658, est: 10000 },
	{ name: "70-79", value: 29677, est: 10000 },
	{ name: "80+", value: 44883, est: 10000 }
];

// ORIGINAL RED GREEN
// const barColor = "#3F3F3F";
// const barHoverColor = '#b3b3b3';
// const colorUp = "#53c88d";
// const colorUpHover = "#CBEEDC";
// const colorUpText = "#42A070";
// const colorDown = "#ed403c";
// const colorDownHover = "#F9C5C4";
// const colorDownText = "#BD3330";

// BLUE ORANGE
// const barColor = "#5B5B5B";
// const barHoverColor = '#b3b3b3';
// const colorUp = "#FFA500";
// const colorUpHover = "#ffe4b2";
// const colorUpText = "#FFA500";
// const colorDown = "#005AFF";
// const colorDownHover = "#b2cdff";
// const colorDownText = "#005AFF";

// SOFTER RED & LIGHTER GREEN
const barColor = "#3F3F3F";
const barHoverColor = '#b3b3b3';
const colorUp = "#6fdc8c";
const colorUpHover = "#d3f4dc";
const colorUpText = "#42A070";
const colorDown = "#f0695f";
const colorDownHover = "#fbdddb";
const colorDownText = "#BD3330";
const barOutlineColor = "rgba(63,63,63,0.1)";
const barOutlineColorHover = "rgba(63,63,63,0.03)";

const borderWidth = 1.5;

const animationDuration = 2000;
const waitDuration = 1000;
var animating = true;
var initialized = false;
var showEstimate = false;

var svg = null;
const width = 900;
const height = 460;
const margin = { top: 50, bottom: 60, left: 50, right: 50 };

const x = d3.scaleBand()
	.domain(d3.range(data.length))
  .range([margin.left, width - margin.right])
	.padding(0.3)
	
const axisNumberFormat = {
	'decimal': ',',
	'thousands': ' ',
	'grouping': [3],
	'currency': ['', ''],
};

var numberFormat = this.d3.formatDefaultLocale(axisNumberFormat);
	
var maxYVal = parseInt(
	d3.max(data, function (d) {
		return d.value;
	})
);

const y = d3.scaleLinear()
	.domain([0, maxYVal+maxYVal/6])
	.range([height - margin.bottom, margin.top])

// TOOLTIP: https://medium.com/analytics-vidhya/how-and-why-to-add-a-chart-to-your-d3-js-tooltip-6aca4ecfd79d
var tool_tip_est = d3.tip()
	.attr("class", "d3-tip")
	.offset(function(d){ 
		var y = 52 + (d.est.toString().length-1)*4.1;
		return [17.2,y];
	})
  .html(
		// function(d) { return new Intl.NumberFormat('fr-BE').format(d.est); }
		function(d) { return d3.format(" ,")(d.est); }
  );

var tool_tip = d3.tip()
	.attr("class", "d3-tip")
	.offset(function(d){ 
		var y = 52 + (d.value.toString().length-1)*4.1;
		return [17.2,y];
	})
  .html(
		function(d) {
			if (showEstimate) {
				showEstimate = false;
				return d3.format(" ,")(d.est);
			} else {
				showEstimate = false;
				return d3.format(" ,")(d.value); 
			}
			
		}
	);

	
// DRAG FUNCTIONALITY (https://github.com/d3/d3-brush)
var brushY = d3.brushY()
	// SET OVERLAY IN WHICH TO EXPAND/SHRINK THE BAR
  .extent(function (d, i) {
			 return [[x(i), y(maxYVal + maxYVal/6)],
			 				// Set minimal value
							// [x(i) + x.bandwidth(), y(maxYVal/20)]];})
							[x(i) + x.bandwidth(), y(1)]];})
	.on("start", startMoveY)
	.on("brush", brushmoveY)
	.on("end", endMoveY)
	.handleSize([20]);


svg = d3.select("#comparison-container")
	.append("svg")
	.attr("width", width - margin.left - margin.right)
	.attr("height", height - margin.top - margin.bottom)
	.attr("viewBox", [0, 0, width, height]);

svg.append("g").call(make_y_gridlines);
svg.call(tool_tip_est);

svg
  .selectAll('.brush')
    .data(data)
  .enter()
    .append('g')
      .attr('class', 'brush')
		.call(brushY)
			// SET INITIAL HEIGHT
			.call(brushY.move, function (d){return [d.est, 0].map(y);});

d3.selectAll('.brush>.handle--s').remove();

svg.selectAll("rect").filter(".selection")
	.attr("id", function(d,i){ return "bar"+i})
	.on("mouseover", function(d, i) {	if(!animating) {handleMouseOverEst(d, i)}})
	.on("mouseout", function(d, i) { if(!animating) {handleMouseOutEst(d,i)}});

svg.selectAll("rect").filter(".handle--n")
	.attr("id", function(d,i){ return "handle"+i})
	.on("mouseover", function(d, i) { if(!animating) {handleMouseOverEst(d, i)}})
	.on("mouseout", function(d, i) { if(!animating) {handleMouseOutEst(d,i)}});

svg.append("g").call(xAxis);
svg.append("text")      // text label for the x axis
        .attr("x", height )
        .attr("y", height - 4 )
        .style("text-anchor", "middle")
        .text("Age group");

svg.append("g").call(yAxis);
svg.append("text")
	.attr("transform", "rotate(-90)")
	.attr("y", 0 - margin.left-20)
	.attr("x",0 - (height / 2))
	.attr("dy", "1em")
	.style("text-anchor", "middle")
	.text("Number of cases");

initialized = true;


/* ----- COMPARISONS ----- */
d3.select("button").on("click", function(event) {
	document.getElementById("button").style.display="none";

	// DELETE ESTIMATE
	svg.selectAll("*").remove();
	d3.select("svg").remove();

	svg = d3.select("#comparison-container")
		.append("svg")
		// .attr("style","background-color:green")
		.attr("width", width - margin.left - margin.right)
		.attr("height", height - margin.top - margin.bottom)
		.attr("viewBox", [0, 0, width, height]);

	svg.append("g").call(xAxis);
	svg.append("text")      // text label for the x axis
        .attr("x", height )
        .attr("y", height - 4 )
        .style("text-anchor", "middle")
        .text("Age group");

	svg.append("g").call(yAxis);
	svg.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 0 - margin.left-20)
		.attr("x",0 - (height / 2))
		.attr("dy", "1em")
		.style("text-anchor", "middle")
		.text("Number of cases");
		svg.append("g").call(make_y_gridlines);

	svg.call(tool_tip);

	// ADD BAR 'OUTLINE' => GREY ZONE
	svg
	.append("g")
	.attr("fill", barOutlineColor)
	.selectAll("rect")
	.data(data)
	.join("rect")
		.attr("id", function(d,i){ return "barOutline"+i})
		.attr("x", (data, index) => x(index))
		.attr("y", d => y(d.est))
		.attr("height", d => y(0) - y(d.est))
		.attr("width", x.bandwidth())
		// .attr('title', (d) => d.value)
		.attr("class", "rect")
		.on("mouseover", function(d, i) {	if(!animating) {handleMouseOver(d, i)}})
		.on("mouseout", function(d, i) { if(!animating) {handleMouseOut(d,i)}});

	// ADD BAR 'OUTLINE' => WITH BORDER
	// svg
	// .append("g")
	// .attr("fill", "none")
	// .selectAll("rect")
	// .data(data)
	// .join("rect")
	// 	.attr("id", function(d,i){ return "barBorder"+i})
	// 	.attr("x", (data, index) => x(index)+borderWidth/2)
	// 	.attr("y", d => y(d.est + 1))
	// 	.attr("height", d => y(0) - y(d.est - 2))
	// 	.attr("width", x.bandwidth()-borderWidth)
	// 	// .attr('title', (d) => d.value)
	// 	.attr("class", "rect")
	// 	.style("stroke", barColor)
	// 	.style("stroke-width", borderWidth)
	// 	.on("mouseover", function(d, i) { if(!animating) {handleMouseOver(d, i)}})
	// 	.on("mouseout", function(d, i) { if(!animating) {handleMouseOut(d,i)}});

	// ADD BARS
	svg
		.append("g")
		.attr("fill", barColor)
		.selectAll("rect")
		.data(data)
		.join("rect")
			.attr("id", function(d,i){ return "bar"+i})
			.attr("x", (data, index) => x(index))
			.attr("y", d => y(d.est))
			.attr("height", d => y(0) - y(d.est))
			.attr("width", x.bandwidth())
			.attr('title', (d) => d.value)
			.attr("class", "rect")
			.on("mouseover", function(d, i) {	if(!animating) {handleMouseOver(d, i)}})
			.on("mouseout", function(d, i) { if(!animating) {handleMouseOut(d,i)}});
	
	// ADD ESTIMATE LINES
	svg.append('g')
		.selectAll('line')
		.data(data)
		.join("line")
			.style("visibility", "hidden")
			.style("stroke", (d) => upOrDownColor(d))
			.style("stroke-width", 3)
			.attr("x1", (data, index) => x(index))
			.attr("y1", d => y(d.est))
			.attr("x2", (data, index) => (x(index) + x.bandwidth()))
			.attr("y2", d => y(d.est))
			.attr("id", function(d,i){ 
				if(d.value > d.est) {
					return "lineUp"+i;
				} else {
					return "lineDown"+i;
				}
			})
			.on("mouseover", function(d, i) {	if(!animating) {handleMouseOver(d, i)}})
			.on("mouseout", function(d, i) { if(!animating) {handleMouseOut(d,i)}});

	// ADD ERROR ARROWS
	svg.append('g')
		.selectAll('line')
		.data(data)
		.join("line")
			.style("visibility", "hidden")
			.style("stroke", (d) => upOrDownColor(d))
			.style("stroke-width", 3)
			.attr("x1", (data, index) => (x(index) + x.bandwidth()/2))
			.attr("y1", d => y(d.est))
			.attr("x2", (data, index) => (x(index) + x.bandwidth()/2))
			.attr("y2", d => y(d.est))
			.attr("id", function(d,i){ 
				if(d.value > d.est) {
					return "arrowUp"+i;
				} else {
					return "arrowDown"+i;
				}
			})
			.attr('marker-end',	(data, index) => arrowHead(data, index))
			.on("mouseover", function(d, i) {	if(!animating) {handleMouseOver(d, i)}})
			.on("mouseout", function(d, i) { if(!animating) {handleMouseOut(d,i)}});


	animating = true;
	for (let i = 0; i < data.length; i++) {
		setTimeout(function(event) {animateBar(data[i],i)}, (animationDuration + waitDuration*2) * i);
	}
	setTimeout(function() {
		animating = false; 
		tool_tip.hide();
		document.getElementById("feedback").innerHTML = "Hover over the bars to study the results.";
	}, (animationDuration + waitDuration*2) * data.length + 100);
	
});
	


// ADD X-AXIS
function xAxis(g) {
	g.attr("transform", `translate(0,${height - margin.bottom})`)
		.call(d3.axisBottom(x).tickFormat(i => data[i].name))
		.attr("font-size", '18px')
		.attr("font-family", "'Libre Franklin', sans-serif")
}

// ADD Y-AXIS
function yAxis(g) {
	g.attr("transform", `translate(${margin.left}, 0)`)
		.call(d3.axisLeft(y).ticks(null, data.format))
		.attr("font-size", '18px')
		.attr("font-family", "'Libre Franklin', sans-serif");
}

function make_y_gridlines(g) {
  g.append("g")			
  .attr("class", "grid")
  .attr("transform", `translate(${margin.left}, 0)`)
  .call(d3.axisLeft(y).ticks(10)
      .tickSize(-width+margin.right*2)
      .tickFormat("")
  )
}

function upOrDownColor(d) {
	if(d.value > d.est) {
		return colorUp;
	} else {
		return colorDown;
	}
}

// ESTIMATION FUNCTIONS
function brushmoveY() {
	var d0 = d3.event.selection.map(y.invert);
	var d = d3.select(this).select('.selection');
	
	if (initialized) {
		for (var i=0; i<data.length; i++) {
			if (data[i].name == d.data()[0].name) {
				d.datum().est= parseInt(d0[0]); // Change the value of the original data
				handleMouseOverEst(d.data()[0], i);
			}
		}
	}
}

function startMoveY() {
	animating = true;

	var d = d3.select(this).select('.selection');
	if (initialized) {
		for (var i=0; i<data.length; i++) {
			if (data[i].name == d.data()[0].name)
				handleMouseOverEst(d.data()[0], i);
		}
	}
}

function endMoveY() {
	animating = false;	

	var d = d3.select(this).select('.selection');
	if (initialized) {
		for (var i=0; i<data.length; i++) {
			if (data[i].name == d.data()[0].name) {
				if (!isMouseOnHandle(i, d3.mouse(this)))
					handleMouseOutEst(d.data()[0], i);
			}
		}
	}
}

// Check if mouse if still over handle to keep focus on bar or not
function isMouseOnHandle(i, mouseCoords) {
	var node = d3.select("#handle"+i).node();
	// console.log(node);
	// console.log(mouseCoords[0] + " -> " + node.x.baseVal.value + " => " + (mouseCoords[0]-node.x.baseVal.value));
	// console.log(mouseCoords[1] + " -> " + node.y.baseVal.value + " => " + (mouseCoords[1]-node.y.baseVal.value));
	var xOK = (mouseCoords[0]-node.x.baseVal.value) > 0 && (mouseCoords[0]-node.x.baseVal.value) < node.width.baseVal.value;
	var yOK = (mouseCoords[1]-node.y.baseVal.value) > 0 && (mouseCoords[1]-node.y.baseVal.value) < node.height.baseVal.value
	// console.log(xOK + " - " + yOK);
	return xOK && yOK;
	// return false;
}

function handleMouseOverEst(d, i) {
	tool_tip_est.show(data[i], document.getElementById("bar" + i));
	for(j=0;j<data.length;j++){
		if (i != j) {
			d3.select("#bar" + j).transition().style("fill", barHoverColor);
		}
	}
}
function handleMouseOutEst(d, i) {
	tool_tip_est.hide(data[i], document.getElementById("bar" + i));
	for(j=0;j<data.length;j++){
		if (i != j){
			d3.select("#bar" + j).transition().style("fill", barColor);
		}
	}
}

// COMPARISON FUNCTIONS

// ARROW HEADS (http://jsfiddle.net/igbatov/v0ekdzw1/)
function arrowHead(d, i) {
	svg.append("svg:defs").append("svg:marker")
		.style("visibility", "hidden")
		.attr("id", function(){ 
			if(d.value > d.est) {
				return "arrowHeadUp"+i;
			} else {
				return "arrowHeadDown"+i;
			}
		})
		.attr("refX", 11)
		.attr("refY", 6)
		.attr("markerWidth", 30)
		.attr("markerHeight", 30)
		.attr("markerUnits","userSpaceOnUse")
		.attr("orient", "auto-start-reverse")
		.append("path")
		.attr("id", function(){ 
			if(d.value > d.est) {
				return "arrowHeadFillUp"+i;
			} else {
				return "arrowHeadFillDown"+i;
			}
		})
		.attr("d", "M 0 0 12 6 0 12 3 6")
		.style("fill", upOrDownColor(d));

		if(d.value > d.est) {
			return "url(#arrowHeadUp"+i+")";
		} else {
			return "url(#arrowHeadDown"+i+")";
		}
}

// ADD INTERACTIVITY
function handleMouseOver(d, i, est = false) {
	if (est) {
		showEstimate = true;
	}
	tool_tip.show(d, document.getElementById("bar" + i));
	setFeedback(d);
	for(j=0;j<data.length;j++){
		if (i != j) {
			d3.select("#bar" + j).transition().style("fill", barHoverColor);
			d3.select("#barOutline" + j).transition().style("fill", barOutlineColorHover);
			d3.select("#barBorder" + j).transition().style("stroke", barHoverColor)
			d3.select("#lineUp" + j).transition().style("stroke", colorUpHover);
			d3.select("#lineDown" + j).transition().style("stroke", colorDownHover);
			d3.select("#arrowUp" + j).transition().style("stroke", colorUpHover)
			d3.select("#arrowDown" + j).transition().style("stroke", colorDownHover);
			d3.select("#arrowHeadFillUp" + j).transition().style("fill", colorUpHover);
			d3.select("#arrowHeadFillDown" + j).transition().style("fill", colorDownHover);
		}
	}
}

function handleMouseOut(d, i) {
	tool_tip.hide(d, document.getElementById("bar" + i));
	setFeedback("");
	for(j=0;j<data.length;j++){
		if (i != j){
			d3.select("#bar" + j).transition().style("fill", barColor);
			d3.select("#barOutline" + j).transition().style("fill", barOutlineColor);
			d3.select("#barBorder" + j).transition().style("stroke", barColor)
			d3.select("#lineUp" + j).transition().style("stroke", colorUp);
			d3.select("#lineDown" + j).transition().style("stroke", colorDown);
			d3.select("#arrowUp" + j).transition().style("stroke", colorUp);
			d3.select("#arrowDown" + j).transition().style("stroke", colorDown);
			d3.select("#arrowHeadFillUp" + j).transition().style("fill", colorUp);
			d3.select("#arrowHeadFillDown" + j).transition().style("fill", colorDown);
		}
	}
}

// ADD ANIMATION
// https://bl.ocks.org/guilhermesimoes/be6b8be8a3e8dc2b70e2
// https://www.d3-graph-gallery.com/graph/barplot_animation_start.html
function animateBar(d, i) {
	handleMouseOver(d, i, true);

	setTimeout(function() {

		d3.select("#lineUp" + i).transition("transition").style("visibility", "visible").duration(animationDuration);
		d3.select("#arrowUp" + i).transition("transition").style("visibility", "visible").attr("y2", d => y(d.value)).duration(animationDuration);

		d3.select("#lineDown" + i).transition("transition").style("visibility", "visible").duration(animationDuration);
		d3.select("#arrowDown" + i).transition("transition").style("visibility", "visible").attr("y2", d => y(d.value)).duration(animationDuration);
		d3.select("#bar" + i).transition("transition")
			.attr("height", function(d) { return height - y(d.value) - margin.bottom; })
			.duration(animationDuration)
			.attrTween('y', function (d, j) {
				return function (t) {
					var tooltipVal = d3.interpolate(d.est, d.value)(t);
					animateTooltip(i, tooltipVal);

					var ip_value = d3.interpolate(y(d.est), y(d.value))(t);
					var diff = Math.abs(ip_value - y(d.est));
					var arrowHeadShown = false;
					if (diff > 10 && !arrowHeadShown) {
						showArrowHead(i);
						arrowHeadShown = true;
					}
					return ip_value;
				};
		});

	}, waitDuration);
	setTimeout(function() {handleMouseOut(d, i);}, animationDuration + waitDuration*2 - 20);
}

function showArrowHead(i){
	d3.select("#arrowHeadFillDown" + i).transition("transition").style("visibility", "visible");
	d3.select("#arrowHeadFillUp" + i).transition("transition").style("visibility", "visible");
}

function animateTooltip(i,ip_value) {
	var temp = {name: "", value: Math.round(ip_value), est: 0};
	tool_tip.show(temp, document.getElementById("bar" + i));
}

// TEXT BASED FEEDBACK
function setFeedback(d) {
	if (d == "" || animating) {
		document.getElementById("feedback").innerHTML = "";
	} else {
		var diff = Math.abs(d.value - d.est);
		var percent = Math.round(((diff / d.value)*100));
		if (d.est > d.value) {
			document.getElementById("feedback").innerHTML = "The correct value for " + d.name + " was <span style='color: " + colorDownText + ";'><b>" + d3.format(" ,")(diff) + " </b></span> cases <span style='color: " + colorDownText + ";'><b> lower </b></span> than you estimated."  // (-" + percent + "%)";
		} else {
			document.getElementById("feedback").innerHTML = "The correct value for " + d.name + " was <span style='color: " + colorUpText + ";'><b>" + d3.format(" ,")(diff) + " </b></span> cases <span style='color: " + colorUpText + ";'><b> higher </b></span> than you estimated."  // (+" + percent + "%)";
		}
	}	
}

// Draws everything
// svg.node();
		
