const express = require("express")
const app = express()
const fetch = require("node-fetch")
const bodyParser = require("body-parser")
const mongoose = require("mongoose"),
	  passport = require("passport"),
	  LocalStrategy = require("passport-local")
	  Campground = require("./models/campground"),
	  User = require("./models/user")
	  seedComments = require("./seeds"),
	  Comment = require("./models/comment"),
	  methodOverride = require("method-override"),
	  flash = require("connect-flash")

//seedComments()
app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended: true}))
mongoose.connect("mongodb://localhost:27017/yelp_camp", {useNewUrlParser:true , useUnifiedTopology: true, useFindAndModify: false})
app.use(express.static("public"))
app.use(methodOverride("_method"))
app.use(flash())

app.use(require("express-session")({
	secret: "Ima big big secret",
	resave: false,
	saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use(function(req, res, next){
	res.locals.currentUser = req.user
	res.locals.error  = req.flash("error")
	res.locals.success  = req.flash("success")
	next()
})

app.get("/", (req, res) => {
	res.render("landing")
})

app.get("/campgrounds", (req, res) => {
		Campground.find({},(err, dbCampgrounds) => {
			if(err) {
				console.log(err)
			} else {
				res.render("campground/index", {campgrounds: dbCampgrounds})
			}
		})
})

app.post("/campgrounds", isLoggedIn, (req, res) => {
	let name = req.body.name
	let image = req.body.image
	let desc = req.body.description
	let author = {
		id: req.user._id,
		username: req.user.username
	}
	let campground = {name: name, image: image, description: desc, author: author}
	Campground.create(campground, (err, camp) => {
		if(err) {
			console.log(err)
		} else {
			res.redirect("/campgrounds")
		}
	})
})

app.delete("/campgrounds/:id", checkCampgroundOwnership, (req,res) => {
	Campground.findByIdAndRemove(req.params.id, (err) => {
		if(err) {
			console.log(err)
			res.redirect("/campgrounds")
		} else {
			res.redirect("/campgrounds")
		}
	})
})

app.get("/campgrounds/new", isLoggedIn, (req, res) => {
	res.render("campground/new")
})

app.get("/campgrounds/:id", (req, res) => {
	Campground.findById(req.params.id).populate("comments").exec((err, foundCampground) => {
		if(err) {
			console.log(err)
		} else {
			res.render("campground/show", {campground: foundCampground})
		}
		
	})
	
})

app.get("/campgrounds/:id/edit", checkCampgroundOwnership,  (req, res) => {
	Campground.findById(req.params.id, (err, foundCampground) => {
		if(err) {
			console.log(err)
			res.redirect("/campgrounds")
		} else {
			res.render("campground/edit", {campground: foundCampground})
		}
	})
	
})

app.put("/campgrounds/:id", checkCampgroundOwnership, (req, res) => {
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, upadtedCampground)=>{
		if(err) {
			res.redirect("/campgrounds")
		} else {
			res.redirect("/campgrounds/" + req.params.id)
		}
	})
})


app.get("/campgrounds/:id/comments/new", isLoggedIn, (req, res) => {
	Campground.findById(req.params.id, (err, campground) => {
		res.render("comment/new", {campground: campground})
	})
	
})


app.post("/campgrounds/:id/comments", isLoggedIn, (req, res) => {
	Campground.findById(req.params.id, (err, campground) => {
		if(err){
			console.log(err)
			req.flash("error" , "Something went wrong")
			res.redirect("/campgrounds")
		} else {
			Comment.create(req.body.comment, (err, comment) => {
				if(err) {
					req.flash("error" , "Something went wrong")
					console.log(err)
				} else {
					comment.author.id = req.user._id
					comment.author.username = req.user.username
					comment.save()
					campground.comments.push(comment)
					campground.save()
					req.flash("success" , "Comment added successfully")
					res.redirect("/campgrounds/" + req.params.id)
				}
			})
		}
	})
})

app.get("/register", (req, res) => {
	res.render("register")
})

app.post("/register", (req, res) => {
	let user = new User({username: req.body.username})
	User.register(user, req.body.password, (err, user) => {
		if(err) {
			console.log(err)
      		return res.render("register", {"error": err.message});   
		}
		passport.authenticate("local")(req, res, () =>{
			req.flash("success", "Welcome to YelpCamp " + user.username + "!")
			res.redirect("/campgrounds")
		})
	})
})

app.get("/login", (req, res) => {
	res.render("login")
})

app.post("/login", passport.authenticate("local", {
	successRedirect: "/campgrounds",
	failureRedirect: "/login"
	}), (req, res) => {
})

app.get("/logout", (req, res) => {
	req.logout();
	req.flash("success" , "Log out successful")
	res.redirect("/campgrounds")
})

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()) {
		return next()
	} 
	
	req.flash("error" , "You need to be logged in to do that!")
	res.redirect("/login")
	
}

function checkCampgroundOwnership(req, res, next){
	if(req.isAuthenticated()) {
		Campground.findById(req.params.id, (err, foundCampground) => {
			if(err) {
				console.log(err)
				req.flash("error", "Campground not found")
				res.redirect("back")
			} else {
				if (!foundCampground) {
                    req.flash("error", "Item not found.");
                    return res.redirect("back");
                }
				if(foundCampground.author.id.equals(req.user._id)){
					next()
				} else {
					req.flash("error" , "You do not have permission to do that!")
					res.redirect("back")
				}
			}
		})
		
	} else {
		req.flash("error", "You need to be logged in to do that!")
		res.redirect("back")
	}
} 


app.listen(3000, function() {
	console.log("Server listening on port 3000")
})