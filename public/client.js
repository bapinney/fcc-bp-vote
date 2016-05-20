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
                console.dir(data);
                console.dir(status);
            }
        })
    }
    
});