var topics = ["goat","chicken","cow","sheep","pig","cat","dog"];

function addButton(topic) {
    var buttonName = topic.toLowerCase()
    var newButtonDiv = $("<div class='btn-div btn-group'>");
    newButtonDiv.attr("data-topic",buttonName);
    var newButton = $("<button type='button' class='btn btn-info topic-button'>");
    newButton.text(buttonName);
    newButton.attr("data-topic",buttonName);
    newButton.attr("data-set",0);
    var newButtonRemove = $("<button type='button' class='btn btn-danger topic-remove-button'>");
    newButtonRemove.text("X");
    newButtonRemove.attr("data-topic",buttonName);
    newButtonDiv.append(newButton);
    newButtonDiv.append(newButtonRemove);
    $("#button-section").append(newButtonDiv);
}

function addTopic() {
    if ($("#add-animal").val()) {
        addButton($("#add-animal").val());
        var prevButtonStore=localStorage.getItem("user-buttons");

        if (prevButtonStore != undefined) {
            prevButtonStore += $("#add-animal").val() + ",";
        }
        
        localStorage.setItem("user-buttons",prevButtonStore);
    }
}

function setInitialButtonSet() {
    for (var i=0; i<topics.length; i++) {
        addButton(topics[i]);
    }
    var prevButtonStore=localStorage.getItem("user-buttons");
    
    if (prevButtonStore) {
        var storedTopics = prevButtonStore.split(",");

        for (var i=0; i<storedTopics.length; i++) {
            // Filter out blank spaces.
            if (storedTopics[i]) {
                addButton(storedTopics[i]);
            }
        }
    }
}

function addGif(gifInfo,topic) {
    var gifContainer=$('<div class="gif-block">');
    gifContainer.attr("data-topic",topic);
    gifContainer.css("display","inline-block");
    var ratingDiv=$("<h3>");
    ratingDiv.text("Rating: " + gifInfo.rating);
    gifContainer.append(ratingDiv);
    var topicImage=$('<img class="topic-gif">');
    topicImage.attr("src",gifInfo.images.fixed_height_still.url);
    topicImage.attr("data-still",gifInfo.images.fixed_height_still.url);
    topicImage.attr("data-animate",gifInfo.images.fixed_height.url);
    topicImage.attr("data-state","still");
    gifContainer.append(topicImage);
    $("#gif-section").prepend(gifContainer);
}

function removeTopic(topic) {

    var prevButtonStore=localStorage.getItem("user-buttons");
    if (prevButtonStore != undefined) {
        var storedTopics = prevButtonStore.split(",");
        prevButtonStore = "";
        for (var i=0; i<storedTopics.length; i++) {
            if (storedTopics[i] != topic) {
                if (storedTopics[i]) {
                    prevButtonStore += storedTopics[i] + ",";
                }
            }      
        }
        localStorage.setItem("user-buttons",prevButtonStore);
    }

    // Remove anything with the topic from the display.  Buttons & gifs.
    topicGifs = $("[data-topic="+topic+"]");
    for (var i=0; i<topicGifs.length; i++) {
        topicGifs[i].remove();
    }
}

setInitialButtonSet();

$("#button-section").on("click","button",function() {
    var topic = $(this).attr("data-topic");
    var dataSet = parseInt($(this).attr("data-set"));

    // Check if they clicked on the remove button...
    if (this.className.indexOf("topic-remove-button") >= 0) {
        removeTopic(topic);
        return;
    }
    
    var queryURL = "https://api.giphy.com/v1/gifs/search?q=" +
        topic + "&api_key=dc6zaTOxFJmzC&limit=10&rating=g&offset=" + dataSet;
    dataSet += 10;
    $(this).attr("data-set",dataSet);

    $.ajax({
            url: queryURL,
            method: "GET"
           }).then(function(response) {
                for (var i=0; i<response.data.length; i++) {
                    addGif(response.data[i],topic);
                }
        });
});


$("#gif-section").on("click","img",function() {
    var state = $(this).attr("data-state");
    if (state === "still") {
        $(this).attr("data-state","animate");
        $(this).attr("src",$(this).attr("data-animate"));
    }
    else if (state === "animate") {
        $(this).attr("data-state","still");
        $(this).attr("src",$(this).attr("data-still"));
    }
});