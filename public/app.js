// Grab the articles as a json
$.getJSON("/articles", function(data) {
    // For each one
    for (var i = 0; i < data.length; i++) {
      // Display the apropos information on the page
      $("#articles").append("<div class='note' data-id='" + data[i]._id + "'>" + "<h3>" +  data[i].title + "</h3><img src='" + data[i].img + "'><br /><br /><span>" + data[i].summary + "</span><br /><a href='" + data[i].url + "'>Read More.</a><br/></div><hr>");
    }
  });
  
  
  // Whenever someone clicks an element of the class "note"
  $(document).on("click", ".note", function() {
    // Empty the notes from the note section
    $("#notes").empty();
    // Save the id from the p tag
    var thisId = $(this).attr("data-id");
  
    // Now make an ajax call for the Article
    $.ajax({
      method: "GET",
      url: "/articles/" + thisId
    })
      // With that done, add the note information to the page
      .then(function(data) {
        console.log("Article data: ", data)
        // The title of the article
        $("#notes").append("<h2>" + data.title + "</h2>");
        // An input to enter a new title
        $("#notes").append("<input id='titleinput' name='title'>");
        // A textarea to add a new note body
        $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
        // A button to submit a new note, with the id of the article saved to it
        $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
        $("#notes").append("<div class='notes-area'></div>")
  
        // If there's a note in the article
        if (data.notes.length > 0) {
            for(var i = 0; i < data.notes.length ; i++) {
                // Place the title of the note in the title input
                console.log(data.notes[i])
                $(".notes-area").append("<h4>" + data.notes[i].title + "</h4><p>" + data.notes[i].body + "</p></br>");
                $(".notes-area").append("<button class='delete-note' data-id='" + data._id + "' data-note-id='" + data.notes[i]._id + "'>Delete!</button><hr>")
            }
        }
      });
  });
  
  // When you click the savenote button
  $(document).on("click", "#savenote", function() {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");
    console.log("ID OF THE ARTICLE", thisId)
  
    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        title: $("#titleinput").val(),
        // Value taken from note textarea
        body: $("#bodyinput").val()
      }
    })
      // With that done
      .then(function(data) {
        // Log the response
        console.log("Data of the new note saved:", data);

        // Empty the notes section
        $("#notes").empty();
      })
      .catch(function (err) {
        console.log(err);
    });;
  });
  
  $(document).on("click", ".delete-note", function() {
    // Grab the id associated with the note from the submit button
    //url: urlCall + '?' + $.param({"Id": Id, "bolDeleteReq" : bolDeleteReq})
    var thisId = $(this).attr("data-note-id");
    console.log("ABOUT TO DELETE NOTE:", thisId)

    $.ajax({
      method: "DELETE",
      url: "/notes/" + thisId,
    }).then(function(data) {
        console.log("Deleted", data)
    })
      .catch(function (err) {
        console.log(err);
    });;
  });