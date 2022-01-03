const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = 4000;

app.listen(PORT, function () {
  console.log(`✅ Listening on PORT: ${PORT}`);
});

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

app.post("/add", function (req, res) {
  console.log(req.body);
  console.log(req.body.title);
  console.log(req.body.date);
});
