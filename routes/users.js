var express = require("express");
var router = express.Router();

const { checkBody } = require('../modules/checkBody');

var User = require("../models/users");

router.post("/signup", (req, res) => {
  console.log("Signup called");

  if (checkBody(req.body, ['email', 'password'])) {
    User.findOne({ email: req.body.email }).then((data) => {
      if (data) {
        res.json({ result: false, error: "User already exists" });
      } else {
        console.log('in else');
        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
        });
        console.log(newUser);
        newUser.save().then((data) => {
          res.json({ result: true });
        });
      }
    })
  } else {
    //console.log("Email: " + req.body.email);
    res.json({ result: false, error: "Missing or empty fields" });
  }
});

router.post("/signin", (req, res) => {
  if (checkBody(req.body), ['email', 'password']) {
    User.findOne({ email: req.body.email, password: req.body.password }).
      then((data) => {
        if (data) res.json({ result: true });
        else res.json({ result: false, error: "User not found" });
      }
      );
  } else {
    res.json({ result: false, error: "Missing or empty fields" });
  }
});


module.exports = router;
