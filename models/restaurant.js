const mongoose = require('mongoose')

/* --------------------------------- REVIEWS -------------------------------- */
const reviewsSchema = new mongoose.Schema(
    {
        rating: {
            type: Number,
            enum: [1,2,3,4,5]
        },
        text: {
            type: String,
            required: true,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId, ref: "User"
        },
    },
    { timestampes: true }
)

/* ------------------------------- RESTAURANT ------------------------------- */
const restaurantSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        hours: {
            type: String,
        },
        image: {
            type: String,
            required: false,
        },
        reviews: [reviewsSchema], 
        category: {
            type: String,
            required: true,
            enum: ["Chinese", "Italian", "Fast Food", "Mexican", "BBQ"]
        },
        author: {
            type: mongoose.Schema.Types.ObjectId, ref: "User"
        },
    },
    { timestamps: true } 
);

const Restaurant = mongoose.model("Restaurant", restaurantSchema);
module.exports = Restaurant;