/* Client-facing JS */

$( document ).ready(function() {
    
    // https://github.com/d3/d3/wiki/Ordinal-Scales#category20
    var color       = d3.scale.category20();
    window.color = color;
    
    if (document.getElementById("button-" + window.location.pathname.substr(1)) !== null) {
        $("#button-" + window.location.pathname.substr(1)).addClass("active");
    }
    
    if($("#vote-dropdown").length > 0 && $("#vote-dropdown")[0].selectedIndex !== 0) {
        $("#vote-dropdown")[0].selectedIndex = 0;
    }
    
    $("#vote-dropdown").change(function() {
        if ($("#vote-dropdown")[0].value == "addNew") {
            $("#custom-option-pane").slideDown();
            $("#custom-option-input").focus();
        }
        if ($("#vote-dropdown")[0].value == "unchosen") {
            $("#cast-vote-button")[0].disabled = true;
        }
        if ($("#vote-dropdown")[0].value == "addNew" && $("#custom-option-input")[0].value.length == 0) {
            $("#cast-vote-button")[0].disabled = true;
        }
        if ($("#vote-dropdown")[0].value != "addNew" && $("#vote-dropdown")[0].value != "unchosen") {
            $("#cast-vote-button")[0].disabled = false;
        }
        if ($("#vote-dropdown")[0].value != "addNew" && $("#custom-option-pane")[0].hidden == false) {
            $("#custom-option-pane").slideUp();
        }
    });
    
    var btnEnableChk = function() {
        if ($("#custom-option-input")[0].value.length > 0) {
            $("#cast-vote-button")[0].disabled = false;
        }
        else {
            $("#cast-vote-button")[0].disabled = true;
        }
    }
        
    $("#custom-option-input").keyup(function() {
       btnEnableChk();
    });
    
    $("#custom-option-input").click(function() {
       btnEnableChk();
    });
    
    /**
     * drawChart will append an SVG to the chart container and graph, using D3, the data passed to it
     * @param {object} data A key/value pair of data points to graph.  The key would be the option selected, and the value would be how many votes that option received
     */
    var drawChart = function(data) {
        console.log("drawChart called");
        console.dir(data);
        
        var svg = d3.select("#chart-container").insert("svg",":first-child")
            .attr("id", "chart")
        
        //We use these values, set by CSS, to center the chart in its container
        var containerWidth = document.getElementById("chart-container").clientWidth;
        var containerHeight = document.getElementById("chart-container").clientHeight;
        console.log("Container dimensions: " + containerWidth + ", " + containerHeight);
        
        //We want the radius to be the shorter of the two dimensions, so that the pie chart does not get cut off.
        var radius = Math.min(containerHeight, containerWidth) / 2.25;
        console.log("Radius is " + radius);
        
        svg.attr("width", containerWidth).attr("height", containerHeight)
        
        var mainGroup = svg.append("g")
            .attr("transform", "translate(" + containerWidth / 2 + "," + containerHeight / 2 + ")");
        
        //Create our main group (in the center)
        console.log("append a 'g' with: " + "transform", "translate(" + containerWidth / 2 + "," + containerHeight / 2 + ")");
        
        
        var arc         = d3.svg.arc().outerRadius(radius);
        var labelArc    = d3.svg.arc().outerRadius(radius - 35).innerRadius(radius - 35);
        
        var tip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);
        
        //Create our pie.  We are using null for sort() because our data is already sorted for us.
        var pie = d3.layout.pie().value(function(d) { return d.nVotes; }).sort(null);

        var path = mainGroup.selectAll('path')
            .data(pie(data))
            .enter()
            .append('path')
            .attr('d', arc)
            .attr('class', 'slice')
            .attr('fill', function(d, i) {
                return color(d.data.nOption);
            })
            .on("mouseover", function (d) {
                console.dir(d);
                tip.transition()
                    .duration(500)
                    .style("opacity", 0);
                tip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tip.text(d.data.nVotes + " votes")
                    .style("left", (d3.event.pageX - 0) + "px") //Don't change the X's.  It's nice to have the left-edge of the tooltip directly over the pointer
                    .style("top", (d3.event.pageY - 50) + "px");
            })
            .on("mousemove", function(d) {
                tip
                    .html(d.data.optionLabel + "<br>" + d.data.nVotes + " votes")
                    .style("left", (d3.event.pageX - 0) + "px")
                    .style("top", (d3.event.pageY - 50) + "px");
            })
            .on("mouseout", function (d) {
                tip.transition()
                    .duration(200)
                    .style("opacity", 0);
            })
            .transition()
            .ease("bounce")
            .duration(2000)
            .attrTween("d", tweenPie);
        
        function tweenPie(b) {
            b.innerRadius = 0;
            var i = d3.interpolate({startAngle: -1, endAngle: 0}, b);
            return function(t) { return arc(i(t)); };
        }
        
    }
    
    var drawLegend = function(data) {
        for (var i=0; i < data.length; i++) {
            var div = document.createElement("div");
            var colorSpan = document.createElement("span");
            colorSpan.innerHTML = "&block;";
            colorSpan.style.color = color(i);
            div.appendChild(colorSpan);
            var descSpan = document.createElement("span");
            descSpan.textContent = data[i].optionLabel + ": ";
            if (data[i].nVotes > 1) {
                descSpan.textContent += data[i].nVotes + " votes";
            }
            else if (data[i].nVotes == 1) {
                descSpan.textContent += "1 vote";
            }
            else {
                descSpan.textContent += "no votes";
            }
            div.appendChild(descSpan);
            document.getElementById("results-legend").appendChild(div);
        }
    }
    
    if(window.location.pathname.split("/")[1] == "poll" && window.location.pathname.split("/")[2].length == 24) {
        var currentPath = window.location.pathname.split("/");
        console.log("We are at a poll page!!");
        //Let's do some AJAX to get the chart data
        var chartID = window.location.pathname.split("/")[2];
        console.log("Querying for chart " + chartID + "...");
        console.dir(currentPath);
        var queryURL = window.location.origin + "/getChartData/" + chartID;
        $.ajax(queryURL, {
            success: function(data, status) {
                console.log("AJAX Success:  Echoing data and status...");
                console.dir(data);
                console.dir(status);
                document.dcopy = data;
                drawChart(data);
                drawLegend(data);
            }
        })
    }
    
});