const mongoose = require("mongoose")


const campgroundSchema = new mongoose.Schema({
	name: String,
	image: String,
	description: String,
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	},	
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Comment"
		}
	]
})

module.exports = mongoose.model("Campground", campgroundSchema)

// { "_id" : ObjectId("5e7d0e850fe55c05590f3556"), "name" : "Salmon Creek", "image" : "https://source.unsplash.com/re2LZOB2XvY", "__v" : 0 }
// { "_id" : ObjectId("5e7d0f2916c316060cfadaa3"), "name" : "Granite Hill", "image" : "https://source.unsplash.com/0AV7XLABuZk", "__v" : 0 }
// { "_id" : ObjectId("5e7d0f69d65288065b387ae0"), "name" : "Mountain Goat's Hill", "image" : "https://source.unsplash.com/ebnlHkqfUHY", "__v" : 0 }
// { "_id" : ObjectId("5e7d11fecdf79a089df51cd7"), "name" : "Golden Bay", "image" : "https://source.unsplash.com/euaPfbR6nC0", "__v" : 0 }

// Campground.create({
// 	name : "Granite Hill", image : "https://source.unsplash.com/0AV7XLABuZk", description: "This is a huge granite rock, no bathrooms, no water, beautiful granite!"
// }, (err, campground) => {
// 	if(err) {
// 		console.log(err)
// 	} else {
// 		console.log(campground)
// 	}
// })