const express = require("express")
const verifyToken = require("../middleware/verify-token.js")
const Restaurant = require("../models/restaurant.js");
const router = express.Router();

router.use(verifyToken);

/* ---------------------------- CREATE RESTAURANT --------------------------- */
router.post("/", async (req, res) => {
    try {
        req.body.author = req.user._id;
        const restaurant = await Restaurant.create(req.body);
        restaurant._doc.author = req.user;
        res.status(200).json(restaurant)
    } catch (error) {
        res.status(500).json(error);
    }
})


/* --------------------------- GET ALL RESTAURANTS -------------------------- */
router.get("/", async (req, res) => {
    try {
        const restaurants = await Restaurant.find({})
            .populate("author")
            .sort({ createdAt: "desc" })
        res.status(200).json(restaurants)
    } catch (error) {
        console.log(error)
        res.status(500).json(error);
    }
});

/* ------------------------- GET SELECTED RESTAURANT ------------------------ */
router.get('/:restaurantId', async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.restaurantId)
        .populate(
            {
                path: 'reviews',
                populate: {
                    path: 'author',
                    select: 'username'
                }
            }
            // "author", "reviews.author"
        )
        res.status(200).json(restaurant)
    } catch (error) {
        res.status(500).json(error);
    }
})

/* ------------------------- UPDATING A RESTAURANT ------------------------- */
router.put('/:restaurantId', async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.restaurantId)
        if (!restaurant.author.equals(req.user._id)) {
            return res.status(403).send('Access denied')
        }
        const updatedRestaurant = await Restaurant.findByIdAndUpdate(
            req.params.restaurantId,
            req.body,
            { new: true }
        );
        updatedRestaurant._doc.author = req.user
        res.status(200).json(updatedRestaurant)
    } catch (error) {
        res.status(500).json(error)
    }
});

/* ---------------------------- DELETE RESTAURANT --------------------------- */
router.delete('/:restaurantId', async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.restaurantId)
        if (!restaurant.author.equals(req.user._id)) {
            return res.status(403).send('Access denied')
        }
        const deletedRestaurant = await Restaurant.findByIdAndDelete(
            req.params.restaurantId
        )
        res.status(200).json(deletedRestaurant)
    } catch (error) {
        res.status(500).json(error)
    }
})

/* --------------------------------- REVIEWS -------------------------------- */
router.post('/:restaurantId/reviews', async (req, res) => {
    try {
        req.body.author = req.user._id;
        const restaurant = await Restaurant.findById(req.params.restaurantId).populate('reviews.author')
        if(!restaurant) {
            return res.status(404).json({ message: "Restaurant Not Found"})
        }

        if(!restaurant.reviews) restaurant.reviews = [];
        restaurant.reviews.push(req.body)
        await restaurant.save();

        const newReview = restaurant.reviews[restaurant.reviews.length - 1]
        newReview._doc.author = req.user
        res.status(201).json(newReview)
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})

/* ------------------------------ DELETE REVIEW ----------------------------- */
router.delete('/:restaurantId/reviews/:reviewId', async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.restaurantId)
        restaurant.reviews.remove({ _id: req.params.reviewId })
        await restaurant.save();
        res.status(200).json({ message: "Deleted" })
    } catch (error) {
        res.status(500).json(error)
    }
});

/* ------------------------------ UPDATE REVIEW ----------------------------- */
router.put('/:restaurantId/reviews/:reviewId', async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.restaurantId)
        const review = restaurant.reviews.id(req.params.reviewId);
        review.text = req.body.text;
        review.rating = req.body.rating;
        await restaurant.save();
        res.status(200).json({ message: "Review Updated" })
    } catch (error) {
        res.status(500).json(error)
    }
});

module.exports = router;