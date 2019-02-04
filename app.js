var express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  passport = require("passport"),
  LocalStrategy = require("passport-local"),
  passportLocalMongoose = require("passport-local-mongoose"),
  user = require("./models/user") , 
  post = require('./models/post'),
  multer = require('multer'),
  fs = require('fs'),
  upload = multer({ dest: 'upload/' }),
  type = upload.single('recfile');

  mongoose.connect(
    process.env.DATABASEURL || "mongodb://localhost:27017/Blogger",
    { useNewUrlParser: true }
  );  

  app.use(
    require("express-session")({
      secret: process.env.SECRET || "sibi",
      resave: false,
      saveUninitialized: false
    })
  );


  app.use(bodyParser.urlencoded({ extended: true }));
  app.set("view engine", "ejs");
  app.use(express.static("public"));
  app.use(passport.initialize());
  app.use(passport.session());  


passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());
passport.use(new LocalStrategy(user.authenticate()));

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

function isAdmin(req, res, next) {
  if (req.isAuthenticated()) {
    if(req.user.username == 'admin')
    {
      return next();
    }
    else
    {
      res.redirect("/home");
    }
  }
  else
  {
  res.redirect("/login");
  }
}

// The root that redirects to home
app.get("/", function(req, res) {
  res.redirect("/home"   );
});

//The homepage for the user
app.get("/home", function(req, res) {  
  res.render("home" , {user1 : req.user});  
});

//Display form to register user
app.get("/register", function(req, res) {
  res.render("register", { user: req.user });
});

//Register the user
app.post("/register", function(req, res) {
  req.body.username;
  req.body.password;

  user.register(
    new user({ username: req.body.username , email: req.body.mail }),
    req.body.password,
    function(err, user) {
      if (err) {
        console.log(err);
        if (err.name == "UserExistsError") {
          return res.render("login", { userexist: true });
        }
      } else {
        passport.authenticate("local")(req, res, function() {
          res.redirect("/home");
        });
      }
    }
  );
});

// Display login form to the user
app.get("/login", function(req, res) {

  res.render("login", { userexist: false });

});

// Logging in the user
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/login"
  }),
  function(req, res) {}
);


//Page for admin to post blog to the database with an interactive view option
app.get("/addblog" , function(req , res){
  res.render("addBlog");
} )

//Post the blog to the database
app.post("/addblog" , type ,  function(req , res){
  // console.log(req.file);
  var tmp_path = req.file.path;
  var target_path = 'public/img/' + req.file.originalname;
  var src = fs.createReadStream(tmp_path);
  var dest = fs.createWriteStream(target_path);
  src.pipe(dest);
  src.on('end', function() {
    
    post.create({title: req.body.title , img: req.file.originalname , text: req.body.blogText , catg: req.body.Category } , function(err , msg)
    {
      if(err)
      {
        console.log(err);
      }
      else
      {
        console.log(msg);
        res.redirect("/addblog");
      }
    })
    
     });
  src.on('error', function(err) { res.render('error'); });


  // console.log(req.body);
}  )

//route to view all blogs in the database
app.get("/viewblogs" ,  function(req ,res) {

  post.find({} , function(err , posts)  {
    if(err) 
    {
      console.log(err);
    }
    else
    {
      res.render('viewblogs' , {posts: posts});
    }
  }  )

  
})




// Log out the user
app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});


app.listen(process.env.PORT || 3000, process.env.IP, function() {
  console.log("The microblogger Server Has Started!");
});
