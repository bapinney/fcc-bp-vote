/* Client-facing JS */

$( document ).ready(function() {
    $("#sign-in").click(function(event) {
        event.preventDefault();
        //console.dir(document.location);
        var locationHash = document.location.hash;
        var form = document.createElement("FORM");
        form.action = "/auth/twitter";
        var inputCBHash = locationHash;
        var formInput = document.createElement("input");
        formInput.type  = "text";
        formInput.name  = "cbHash";
        formInput.value = inputCBHash;
        form.appendChild(formInput);
        form.submit();
    });
});

var dbgGlobals = {}; //A global variable we can assign things to for debugging purposes

// https://github.com/d3/d3/wiki/Ordinal-Scales#category20
var color = d3.scale.category20();

//- Called by app.js if we are at a poll page
var pollInit = function() {
    
    console.log("Inside poll init function...");
    
    console.log("Adding meta tags...");
    
    var meta = document.createElement("meta");
    meta.setAttribute("property", "og:url");
    meta.content = document.location.href;
    document.head.appendChild(meta);

    var meta = document.createElement("meta");
    meta.setAttribute("property", "og:type");
    meta.content = "website";
    document.head.appendChild(meta);

    var meta = document.createElement("meta");
    meta.setAttribute("property", "og:title");
    meta.content = "freeCodeCamp - Vote";
    document.head.appendChild(meta);
    
    var meta = document.createElement("meta");
    meta.setAttribute("property", "og:description");
    meta.content = "freeCodeCamp Voting App";
    document.head.appendChild(meta);
    
    var meta = document.createElement("meta");
    meta.setAttribute("property", "og:image");
    meta.content = encodeURI(window.location.origin + '/favicon.ico')
    document.head.appendChild(meta);
    
    new Clipboard('.cb-copy');
    
    if (document.getElementById("button-" + window.location.pathname.substr(1)) !== null) {
        $("#button-" + window.location.pathname.substr(1)).addClass("active");
    }
    


    
    /**
     * drawChart will append an SVG to the chart container and graph, using D3, the data passed to it
     * @param {object} data A key/value pair of data points to graph.  The key would be the option selected, and the value would be how many votes that option received
     */
    var drawChart = function(data) {
        console.log("drawChart called");
        console.dir(data);
        
        var svg;
        
        // This check is to see if Angular has not already rendered this view, previously, with the elements we needed already inserted into DOM
        if ($("#chart-container").children().length == 0) {
            console.log("Chart container currently has no children.  Inserting SVG...");
            svg = d3.select("#chart-container").insert("svg",":first-child")
            .attr("id", "chart");
        }
        else {
            if ($("#chart-container").children()[0].id == "chart") {
                console.log("Chart already exists.  Setting svg var...");
                svg = d3.select("#chart");
            }
        }
        
        
        //We use these values, set by CSS, to center the chart in its container
        var containerWidth = document.getElementById("chart-container").clientWidth;
        var containerHeight = document.getElementById("chart-container").clientHeight;
        //console.log("Container dimensions: " + containerWidth + ", " + containerHeight);
        
        //We want the radius to be the shorter of the two dimensions, so that the pie chart does not get cut off.
        var radius = Math.min(containerHeight, containerWidth) / 2.25;
        //console.log("Radius is " + radius);
        
        //console.log("About to dir svg");
        //console.dir(svg);
        svg.attr("width", containerWidth).attr("height", containerHeight)
        
        var mainGroup = svg.append("g")
            .attr("transform", "translate(" + containerWidth / 2 + "," + containerHeight / 2 + ")");
        
        //Create our main group (in the center)
        //console.log("append a 'g' with: " + "transform", "translate(" + containerWidth / 2 + "," + containerHeight / 2 + ")");
        
        
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
                //console.dir(d);
                tip.transition()
                    .duration(2000)
                    .style("opacity", 0);
                tip.transition()
                    .duration(200)
                    .style("opacity", .9);
                if (d.data.nVotes == 0) { var votesText = "no votes"; }
                if (d.data.nVotes == 1) { var votesText = "1 vote"; }
                if (d.data.nVotes > 1) { var votesText = d.data.nVotes + " votes"; }
                tip
                    .html(d.data.optionLabel + "<br>" + votesText)
                    .style("left", (d3.event.pageX - 0) + "px") //Don't change the X's.  It's nice to have the left-edge of the tooltip directly over the pointer
                    .style("top", (d3.event.pageY - 50) + "px");
            })
            .on("mousemove", function(d) {
                if (d.data.nVotes == 0) { var votesText = "no votes"; }
                if (d.data.nVotes == 1) { var votesText = "1 vote"; }
                if (d.data.nVotes > 1) { var votesText = d.data.nVotes + " votes"; }
                tip
                    .html(d.data.optionLabel + "<br>" + votesText)
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
            .duration(1500)
            .attrTween("d", tweenPie);
        
        function tweenPie(b) {
            b.innerRadius = 0;
            var i = d3.interpolate({startAngle: -1, endAngle: 0}, b);
            return function(t) { return arc(i(t)); };
        }
        
    }
    
    var drawLegend = function(data) {
        if ($("#results-legend").children().length > 0) {
            //Removes all child-nodes from the legend, if they exist, before drawing anew.
            $("#results-legend").empty();
        }
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
                descSpan.class = "no"
            }
            div.appendChild(descSpan);
            document.getElementById("results-legend").appendChild(div);
        }
    }
    
    var addVoteButton = function(form) {
        var button = document.createElement("button");
        button.accesskey = "v";
        button.form = "vote-form";
        button.type = "submit";
        button.id = "cast-vote-button";
        button.innerHTML = "Cast <u>V</u>ote";
        button.disabled = true; //Disabled by default...
        form.appendChild(button);
    }
    
    var drawVotePane = function(data) {
        console.dir(data);
        var form = document.createElement("form");
        form.action = "/submit-vote";
        form.id = "vote-form";
        form.method = "post";
        var p = document.createElement("p");
        p.innerHTML = "Select an <u>o</u>ption";
        form.appendChild(p);
        var inputPollID = document.createElement("input");
        inputPollID.type = "hidden";
        inputPollID.name = "poll-id";
        inputPollID.value = window.location.hash.split("/")[2];
        var select = document.createElement("select");
        select.accesskey = "o";
        select.id = "vote-dropdown";
        select.name = "vote-selection";
        var option = document.createElement("option");
        option.value = "unchosen";
        option.innerText = "-------------";
        select.appendChild(option);
        for (var i=0; i < data.length; i++) {
            var option = document.createElement("option");
            option.value = i;
            option.innerText = data[i].optionLabel;
            select.appendChild(option);
        }
        var authCheckURL = window.location.origin + "/amiauthed";
        $.ajax(authCheckURL, {
            success: function(data, status) {
                if (data.result === true) {
                    var option = document.createElement("option");
                    option.value = "addNew";
                    option.innerText = "(add a custom option)";
                    select.appendChild(option);
                    var div = document.createElement("div");
                    div.id = "custom-option-pane";
                    div.style = "display:none";
                    var label = document.createElement("label");
                    label.for = "custom-option-input";
                    label.class = "custom-label";
                    label.innerText = "add your own option";
                    var input = document.createElement("input");
                    input.id = "custom-option-input";
                    input.name = "custom-vote";
                    input.type = "text";
                    div.appendChild(label);
                    div.appendChild(input);
                    form.appendChild(div);
                    form.appendChild(inputPollID);
                    addVoteButton(form);
                    registerPollEvents();
                }
                else {
                    var div = document.createElement("div");
                    div.id = "custom-option-pane";
                    div.style = "display:none";
                    form.appendChild(div);
                    form.appendChild(inputPollID);
                    addVoteButton(form);
                    registerPollEvents();
                }
            }
        })
        form.appendChild(select);
        $("#vote-pane").append(form);
        $("#vote-pane").append(input);
        
    };
    
    var registerPollEvents = function() {
        $("#delete-btn").click(function(event) {
            event.preventDefault(); //Prevents this link from changing the hash
            $("#confirm-delete-pane").slideToggle();
            $("#dp-button").focus();
        });

        $("#dp-button").click(function() {
            console.log("Delete Poll clicked");
            //Get the poll id
            var pathArr = document.location.hash.split("/");
            console.dir(pathArr);
            if (pathArr[1] !== "poll") {
                return false;
            }
            $.ajax({
                url: "/delete",
                data: {
                    type: "poll",
                    id: pathArr[2]
                },
                type: "GET",
                dataType: "json",
            })
            .done(function(json) {
                console.log("ajax finished...");
                console.dir(json);
                if (json.hasOwnProperty("result") && json.result === false) {
                    alert("Unable to delete poll.  \nReason: \"" + json.message + "\"");
                    return false;
                }
                if (json.hasOwnProperty("result") && json.result === true) {
                    alert("Poll deleted");
                    document.location.href = "#"; //Redirect back to homepage as it makes no sense to stay on a poll that is now deleted.
                    return true;
                }
            });
        })

        $("#share-btn").click(function(e) {
            e.preventDefault();
            $("#share-links-pane").slideToggle();
            $("#cb-copy").focus();
            $("#share-link")[0].value = document.location.href;
        });

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
    }
    
    var startDrawing = function() {
        var currentPath = window.location.pathname.split("/");
        console.log("We are at a poll page!!");
        //Let's do some AJAX to get the chart data
        var chartID = window.location.hash.split("/")[2];
        console.log("Querying for chart " + chartID + "...");
        //console.dir(currentPath);
        var queryURL = window.location.origin + "/getChartData/" + chartID;
        var haveIVotedURL = window.location.origin + "/haveIVoted/" + chartID;

        $.ajax(queryURL, {
            success: function(data, status) {
                console.log("AJAX Success:  Checking data...");
                console.dir(data);
                var hasVotes = false;
                for (var i=0; i < data.length; i++) {
                    if (data[i].nVotes != 0) {hasVotes = true};
                }
                if (hasVotes) {
                    drawChart(data);
                }
                else {
                    displayNoVotesMessage();
                }
                drawLegend(data);
                console.log("Checking for previous voting...");
                $.ajax(haveIVotedURL, {
                    success: function (vData, status) {
                        console.log("haveIVoted result...");
                        if (vData.hasVoted === false) {
                            console.log("I have not voted, yet.");
                            drawVotePane(data);
                        }
                        else {
                            drawVoteCheck();
                        }
                    }
                });
            }
        });
    }
    
    var drawVoteCheck = function() {
        $("#vote-pane").empty();
        var fai = document.createElement("i");
        fai.classList = "fa fa-check";
        fai.setAttribute("aria-hidden", "true");
        fai.id = "already-voted";
        document.getElementById("vote-pane").appendChild(fai);
        var votedText = document.createElement("span");
        votedText.innerText = "already voted";
        votedText.id = "voted-text";
        document.getElementById("vote-pane").appendChild(votedText);
        
    }
    
    var displayNoVotesMessage = function() {
        console.log("There are no votes, yet, for this poll");
        $("#chart-container").empty(); //Empty anything that may already be in the chart container (e.g., a chart from a previous view...)
        
        var ccMsg = document.createElement("div");
        ccMsg.id = "chart-container-message";
        ccMsg.textContent = "No results yet...";
        dbgGlobals.ccMsg = ccMsg;
        $("#chart-container").append(ccMsg);
    }
    
    window.addEventListener("hashchange", function() {
        console.log("The hash has changed");
        if (window.location.hash.split("/")[1] == "poll") { startDrawing(); }
    });
    
    if(window.location.hash.split("/")[1] == "poll" && window.location.hash.split("/")[2].length == 24) {
        startDrawing();
    }
    
};