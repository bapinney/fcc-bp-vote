$(document).ready(function () {
    $("#cast-vote-button").click(function (event) {
        event.preventDefault();
        var postURL  = $("#vote-form")[0].action;
        var formData = $("#vote-form").serialize();
        console.log("About to post...");
        $.post(postURL, formData, function(dataObj, statusText) {
            console.log("About to dir state...");
            console.dir($state);
            console.dir(dataObj);
            console.dir(statusText);
            if (statusText == "success" && dataObj.hasOwnProperty("pollID")) {
                $("#poll-create")[0].className = "poll-submitted";
                $("#poll-create").html('<i class="fa fa-thumbs-up"></i> Submitted!');
                setTimeout(function() {
                    document.location.href= "#/poll/" + dataObj.pollID;
                }, 1500);
            }
        });
    });
});