require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = 4000;

app.set("view engine", "ejs");

const MongoClient = require("mongodb").MongoClient;

let db;

MongoClient.connect(
  process.env.DB_URL,
  { useUnifiedTopology: true },
  function (err, client) {
    if (err) console.log(err);

    db = client.db("todoapp");

    app.listen(PORT, function () {
      console.log(`✅ Listening on PORT: ${PORT}`);
    });
  }
);

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/write", function (req, res) {
  res.sendFile(__dirname + "/write.html");
});

app.get("/pretty", function (req, res) {
  res.send("Pretty Page");
});

app.get("/list", function (req, res) {
  db.collection("post")
    .find()
    .toArray(function (err, el) {
      res.render("list.ejs", { toDos: el });
    });
});

app.post("/add", function (req, res) {
  db.collection("count").findOne(
    { name: "number of posts" },
    function (err, e) {
      if (err) console.log(err);
      const index = e.totalPost + 1;
      const newToDo = {
        _id: index,
        title: req.body.title,
        date: req.body.date,
      };

      db.collection("post").insertOne(newToDo, function (err, e) {
        if (err) console.log(err);
        console.log("🚀 SAVED!!!");
      });
    }
  );

  db.collection("count").updateOne(
    { name: "number of posts" },
    { $inc: { totalPost: 1 } },
    function (err, el) {
      if (err) console.log(err);
    }
  );

  res.send("Saved");
});
