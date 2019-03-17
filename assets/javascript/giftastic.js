var topics = ["goat","chicken","cow","sheep","pig","cat","dog"];

function addButton(buttonName) {
    var newButton = $("<button type='button' class='btn btn-info topic-button'>");
    newButton.text(buttonName.toLowerCase());
    newButton.attr("data-topic",buttonName.toLowerCase());
    newButton.attr("data-set",0);
    $("#button-section").append(newButton);
}

function addTopic() {
    if ($("#add-animal").val()) {
        addButton($("#add-animal").val());
    }
}

function setInitialButtonSet() {
    for (var i=0; i<topics.length; i++) {
        addButton(topics[i]);
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

setInitialButtonSet();

$("#button-section").on("click","button",function() {
    var topic = $(this).attr("data-topic");
    var dataSet = parseInt($(this).attr("data-set"));
    console.log(dataSet);
    console.log(typeof dataSet);
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