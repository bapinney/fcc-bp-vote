$(document).ready(function() {
    $("#poll-question-input").focus();
    $("#new-poll-form").delegate("input", "keyup", function() {
        
        //If the text input's parent div is the 2nd-to-last div in the FORM, and that input has text...
        if (
            $(this)[0].value.length > 0 &&
            ($(this)[0].parentNode == $("#new-poll-form")[0].children[$("#new-poll-form")[0].children.length - 2])
        ) { //... then create an NAME-less input[type="text"] in a new DIV right below it
            var nOptions = Number(document.getElementById('new-poll-form').children[document.getElementById('new-poll-form').children.length - 2].children[1].id.split("-")[2]);
            $($(this)[0].parentNode).after("<div style=\"display:none;\"></div>");
            var newDiv = $("#new-poll-form")[0].children[$("#new-poll-form")[0].children.length - 2];
            
            $("#poll-label-" + nOptions).removeClass("unused");
            
            var newLabel = document.createElement("label");
            newLabel.setAttribute("for", "poll-option-" + (nOptions + 1));
            newLabel.setAttribute("id", "poll-label-" + (nOptions + 1));
            newLabel.className = "unused";
            newLabel.textContent = "Option " + (nOptions + 1);
            
            var newInput = document.createElement("input");
            newInput.setAttribute("type", "text");
            newInput.setAttribute("id", "poll-option-" + (nOptions + 1));
            newDiv.appendChild(newLabel);
            newDiv.appendChild(newLabel);
            newDiv.appendChild(newInput);
            
            $(newDiv).slideDown(300);
        }
        
        //Add a NAME attribute, so it will be submitted with the FORM, but only if there is content in the INPUT
        if ($(this)[0].hasAttribute("name") == false && $(this)[0].value.length > 0) {
            $(this)[0].name = $(this)[0].id;    
        }
        
        if ($(this)[0].hasAttribute("name") == true && $(this)[0].value.length == 0 && $(this)[0].id !== "poll-option-1" && $(this)[0].id !== "poll-question-input") {
            $(this)[0].removeAttribute("name");
            $(this)[0].parentNode.firstChild.className = "unused";
            var nextDiv = $(this)[0].parentNode.nextSibling;
            if (nextDiv.id !== "create-poll-div") {
                console.log("Will remove div!");
                $(nextDiv).slideUp(300, function() { $(nextDiv).remove(); });
            }
        }
        
        if ($("#poll-create")[0].disabled && 
            $("#poll-question-input")[0].value.length > 2 &&
            $("#poll-option-1")[0].value.length > 0 &&
            $("#poll-option-2")[0].value.length > 0 ) 
        {
            $("#poll-create")[0].disabled = false;
        }
        
        if (!$("#poll-create")[0].disabled && 
            //If the button is enabled, but we don't have a full question AND, at least, 2 responses...
            !(
                $("#poll-question-input")[0].value.length > 2 &&
                $("#poll-option-1")[0].value.length > 0 &&
                $("#poll-option-2")[0].value.length > 0 
            )) {
                //...then disable the button
                $("#poll-create")[0].disabled = true;
        }
        
    });
    $("#poll-create").click(function(event) {
        event.preventDefault(); //Keeps the UA from going to the FORM action
        $("#poll-create")[0].className = "poll-submit"; //Was the poll-create class, previously
        $("#poll-create")[0].innerText = "Submitting poll...";
        $("#poll-create")[0].disabled  = true;
        //Get the POST url from the FORM
        var postUrl = $("#new-poll-form")[0].action;
        var formData = $("#new-poll-form").serialize();
        $.post(postUrl, formData, function(dataObj, statusText) {
            console.log("Post success called!");
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