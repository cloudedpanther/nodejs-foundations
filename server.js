require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");

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

app.use("/public", express.static("public"));

app.use(methodOverride("_method"));

app.use(
  session({ secret: "비밀코드", resave: true, saveUninitialized: false })
);
app.use(passport.initialize());
app.use(passport.session());

app.get("/", function (req, res) {
  res.render("index.ejs");
});

app.get("/write", function (req, res) {
  res.render("write.ejs");
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

  res.redirect("/");
});

app.delete("/delete", function (req, res) {
  const id = parseInt(req.body._id);
  db.collection("post").deleteOne({ _id: id }, function (err, el) {
    res.status(200).send("Successfully deleted.");
  });
});

app.get("/details/:id", function (req, res) {
  const id = parseInt(req.params.id);
  db.collection("post").findOne({ _id: id }, function (err, el) {
    if (err || el === null) res.send("404");
    else res.render("details.ejs", { data: el });
  });
});

app.get("/edit/:id", function (req, res) {
  const id = parseInt(req.params.id);
  db.collection("post").findOne({ _id: id }, function (err, el) {
    if (err || el === null) res.send("404");
    else res.render("edit.ejs", { data: el });
  });
});

app.put("/edit", function (req, res) {
  const id = parseInt(req.body.id);
  db.collection("post").updateOne(
    { _id: id },
    {
      $set: {
        title: req.body.title,
        date: req.body.date,
      },
    },
    function (err, el) {
      console.log(el);
      if (err) res.send("404");
      else res.redirect("/list");
    }
  );
});

app.get("/search", (req, res) => {
  const value = req.query.value;
  const searchKey = [
    {
      $search: {
        index: "titleSearch",
        text: {
          query: value,
          path: "title",
        },
      },
    },
  ];
  db.collection("post")
    .aggregate(searchKey)
    .toArray((err, el) => {
      res.render("search.ejs", { toDos: el });
    });
});

app.get("/login", function (req, res) {
  res.render("login.ejs");
});

app.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/fail" }),
  function (req, res) {
    res.redirect("/");
  }
);

passport.use(
  new LocalStrategy(
    {
      usernameField: "id",
      passwordField: "pw",
      session: true,
      passReqToCallback: false,
    },
    function (입력한아이디, 입력한비번, done) {
      db.collection("users").findOne(
        { id: 입력한아이디 },
        function (에러, 결과) {
          if (에러) return done(에러);

          if (!결과)
            return done(null, false, { message: "존재하지않는 아이디요" });
          if (입력한비번 == 결과.pw) {
            return done(null, 결과);
          } else {
            return done(null, false, { message: "비번틀렸어요" });
          }
        }
      );
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  db.collection("users").findOne({ id: id }, function (err, el) {
    done(null, el);
  });
});

app.get("/mypage", checkLogin, function (req, res) {
  res.render("mypage.ejs", { user: req.user });
});

function checkLogin(req, res, next) {
  if (req.user) next();
  else res.send("Not logged in");
}
