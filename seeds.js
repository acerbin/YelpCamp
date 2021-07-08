const mongoose = require("mongoose"),
	  Campground = require("./models/campground"),
	  Comment = require("./models/comment")


function seedComments() {
	Campground.find({}, (err, campgrounds) => {
	campgrounds.forEach((campground) => {
		Comment.create({
			text: "This place is great but I wish there was internet.",
			author: "Frank Jr"
		}, (err, comment) => {
			if(err) {
				console.log(err)
			} else {
				campground.comments.push(comment)
				campground.save()
			}
			})
		})
	})
}

module.exports = seedComments;



