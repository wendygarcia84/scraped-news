// It works on the client and on the server
var cheerio = require("cheerio");
var axios = require("axios");
var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

var db = require("./models");
var PORT = 3000;
// Initialize Express
var app = express();
// Configure middleware
// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));
// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/scrapednews", { useNewUrlParser: true });

app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://www.foxnews.com/category/world/united-nations").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);
    var results = [];
    // Now, we grab every h2 within an article tag, and do the following:
    $("article").each(function(i, element) {
      // Save an empty result object
        var title = $(element)
        .find("h4 a")
        .text();
        var summary = $(element)
        .find(".content a")
        .text();
        var url = $(element)
        .find("h4 a")
        .attr("href");
        var imgURL = $(element)
        .find(".m img")
        .attr("src")
        results.push({
            title: title,
            summary: summary,
            url: url,
            img: imgURL
        });
        
    });

    db.Article.create(results)
      .then(function(dbArticles) {
        console.log(dbArticles);
      })
      .catch(function(err) {
        console.log(err)
      })
    // Send a message to the client
    console.log(results);
    res.json("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // TODO: Finish the route so it grabs all of the articles
  db.Article
  .find({})
  .then(function(dbArticles){
    res.json(dbArticles);
  })
  .catch(function(err){
    res.json(err)
  })
});

app.get("/articles/:id", function(req, res) {
  // TODO
  // ====
  // Finish the route so it finds one article using the req.params.id,
  // and run the populate method with "note",
  // then responds with the article with the note included
  db.Article
  .findOne({_id: req.params.id})
  .populate("notes")
  .then(function(dbArticle){
    res.json(dbArticle);
  })
  .catch(function(err){
    res.json(err); 
  })
});

app.post("/articles/:id", function(req, res) {
  // TODO
  // ====
  // save the new note that gets posted to the Notes collection
  // then find an article from the req.params.id
  // and update it's "note" property with the _id of the new note
  console.log("APP.POST'S ID", req.body)
  db.Note
  .create(req.body)
  .then(function(dbNote){
    return db.Article
    .findOneAndUpdate(
      {_id: req.params.id}, 
      { $push: { notes: dbNote } }, 
      {new: true});
    })
    .then(function(dbArticle){
      res.json(dbArticle); 
    })
  .catch(function(err){
    res.json(err); 
  })
});

//---NOTES---//

app.get("/notes/:id", function(req, res) {
  // TODO
  // ====
  // Finish the route so it finds one article using the req.params.id,
  // and run the populate method with "note",
  // then responds with the article with the note included
  db.Note
  .findOne({_id: req.params.id})
  .then(function(dbNote){
    res.json(dbNote);
  })
  .catch(function(err){
    res.json(err); 
  })
});

//https://docs.mongodb.com/manual/reference/operator/update/pull/#up._S_pull
//{ $pull: { <field1>: <value|condition>, <field2>: <value|condition>, ... } }

app.delete("/notes:id", function(req, res) {
  db.Note
    .remove(
      { _id: req.params.id }
    )
    .then(function(dbNote){
      res.json(dbNote);
    });
});

app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });