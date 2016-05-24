/* Client-facing JS */

$( document ).ready(function() {
    
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
        
        var svg = d3.select("#poll-results-pane").append("svg")
            .attr("id", "chart-container");
        
        //We use these values, set by CSS, to center the chart in its container
        var containerWidth = document.getElementById("chart-container").clientWidth;
        var containerHeight = document.getElementById("chart-container").clientHeight;
        //console.log(containerWidth + ", " + containerHeight);
        
        //We want the radius to be the shorter of the two dimensions, so that the pie chart does not get cut off.
        var radius = Math.min(containerHeight, containerWidth) / 2;
        
        
        // https://github.com/d3/d3/wiki/Ordinal-Scales#category20
        var color       = d3.scale.category20();

        var arc         = d3.svg.arc().outerRadius(radius - 10).innerRadius(0);
        var labelArc    = d3.svg.arc().outerRadius(radius - 35).innerRadius(radius - 35);
        
        //Create our pie.  No need to use sort() as the default is descending order, which is what we want.  Also, no need to use value(), as the value is already a Number
        var pie = d3.layout.pie().value(function(d) { return d.value; });

        svg.attr("width", containerWidth).attr("height", containerHeight)
        //Create our main group (in the center)
        .append("g")
            .attr("transform", "translate(" + containerWidth / 2 + "," + containerHeight / 2 + ")");
        
        //Just a refresher, "Think of the initial selection as declaring the elements you _want_ to exist" — https://bost.ocks.org/mike/bar/
        var g = d3.selectAll(".arc").data(pie(data)).enter().append("g").attr("class", "arc");
        
        g.append("path").attr("d", arc).style("fill", function(d) { return "green"; });
        
        
        
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
            }
        })
    }
    
});