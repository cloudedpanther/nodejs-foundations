const express = require("express");

const app = express();
const PORT = 4000;

app.listen(PORT, function () {
  console.log(`Listening on PORT: ${PORT}`);
});

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/pretty", function (req, res) {
  res.send("Pretty Page");
});
