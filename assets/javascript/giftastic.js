var topics = ["goat","chicken","cow","sheep","pig","cat","dog"];

// function that adds a new topic button to the (top) button section.
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

// Function that adds a topic - including a button and to the persistant data store
function addTopic() {
    var newTopic = $("#add-animal").val();
    // Ignore blanks.
    if (newTopic) {
        // If the topic hasn't already been added.
        if (topics.indexOf(newTopic) < 0) {
            addButton(newTopic);
            topics.push(newTopic);
            var prevButtonStore=localStorage.getItem("user-buttons");

            if (prevButtonStore != undefined) {
                prevButtonStore += newTopic + ",";
            }
        
            localStorage.setItem("user-buttons",prevButtonStore);
        }
    }
}

// Sets the buttons for the inital 'seed' set of topics 
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
                topics.push(storedTopics[i]);
            }
        }
    }
}

//  Processes a single gif json from the giphy api to add it to the gif section.
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
    topicImage.attr("giphy-id",gifInfo.id);
    gifContainer.attr("giphy-id",gifInfo.id);
    //var imgButtonDiv=$('<div class="img-btn-div">');
    var deleteIcon=$('<img class="delete-icon">');
    deleteIcon.attr("src","./assets/images/x-delete.jpg");
    deleteIcon.attr("giphy-id",gifInfo.id);
    var downloadIcon=$('<img class="download-icon">');
    downloadIcon.attr("src","./assets/images/download_arrow.png");
    downloadIcon.attr("giphy-id",gifInfo.id);
    downloadIcon.attr("download-url",gifInfo.images.fixed_height.url);
    gifContainer.append(topicImage);
    gifContainer.append(deleteIcon);
    //imgButtonDiv.append(downloadIcon);
    //gifContainer.append(imgButtonDiv);
    $("#gif-section").prepend(gifContainer);
}

// Deletes a topic and everything associated with it (ie: button & gifs).
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

// Removes a specific gif section.
function removeGif(buttonRef) {
    var gifId = buttonRef.getAttribute("giphy-id");
    var gifContainers = $(".gif-block");
    
    for (var i=0; i<gifContainers.length; i++) {
        var checkDiv = gifContainers[i];
        if (checkDiv.getAttribute("giphy-id") === gifId) {
            checkDiv.remove();
        }
    }

    var favGifStr = localStorage.getItem("user-favorites");
    if (favGifStr) { 
        var favGifArray = JSON.parse(favGifStr);
        var newFavGifArray = [];
        // Not sure splice would work inside the for loop as it modifies
        // the array length...
        for (var i=0; i<favGifArray.length; i++) {
            // Filter out blank spaces.
            if (favGifArray[i] != gifId ) {
                newFavGifArray.push(favGifArray[i]);
            }
        }

        if (newFavGifArray.length > 0) {
            localStorage.setItem("user-favorites",JSON.stringify(newFavGifArray));
        }
        else {
            localStorage.removeItem("user-favorites");
        }
    }    
}

function downloadImage(buttonRef) {
    console.log("Download",buttonRef);
    var downloadUrl = buttonRef.getAttribute("download-url");
    console.log("Download URL", downloadUrl);
    var downloadAnchor = $("<a>");
    downloadAnchor.href = buttonRef.getAttribute("download-url");
    downloadAnchor.download = buttonRef.getAttribute("giphy-id");
    $("#download-section").append(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

// Function to grab a single (favorite?) gif from the Gihpy API.
function loadGifById(gifId) {
    var queryURL = "https://api.giphy.com/v1/gifs/" + gifId + "?api_key=dc6zaTOxFJmzC";
    $.ajax({
        url: queryURL,
        method: "GET"
       }).then(function(response) {
           addGif(response.data,"favorite");
       });
}

// Loads saved favorite gifs.
function loadFavoriteGifs() {
    var favGifStr = localStorage.getItem("user-favorites");
    if (favGifStr) {        
        var favGifArray = JSON.parse(favGifStr);

        for (var i=0; i<favGifArray.length; i++) {
            // Filter out blank spaces.
            if (favGifArray[i]) {
                loadGifById(favGifArray[i]);
            }
        }
    }
}

function addFavorite(gifContainer) {
    gifContainer.remove();
    $("#favorites-section").prepend(gifContainer);

    var favGifStr = localStorage.getItem("user-favorites");
    if (favGifStr) {        
        var favGifArray = JSON.parse(favGifStr);
    }
    else {
        var favGifArray = [];
    }

    favGifArray.push(gifContainer.getAttribute("giphy-id"));
    favGifStr = JSON.stringify(favGifArray);
    localStorage.setItem("user-favorites",favGifStr);
}


// Set the initial set of 'seed' topics.
setInitialButtonSet();
loadFavoriteGifs();
// Handle clicks to a button.  Can be a topic button - which means 'search giphy' for the 
//  topic, OR it can be a topic delete button.
//
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

//  Handles click on an image.  Toggles from still to animated.
$("#gif-section").on("click","img",function() {
    if (this.className === "delete-icon") {
        removeGif(this);
        return;
    }
    else if (this.className === "download-icon") {
        downloadImage(this);
        return;
    }

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

$("#gif-section").on("mouseenter","img",function() {
    this.style.border = "thick solid #0000FF";
});

$("#gif-section").on("mouseleave","img",function() {
    this.style.border = "none";
});

// Double click means 'add to favorites'.
$("#gif-section").on("dblclick","div",function() {
    addFavorite(this);
});