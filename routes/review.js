/*
We have created this folder to use the functionalities of the Router object in JS, which helps make our code less bloated, by creating a
separate files for all the routes that we have in our site.
This file contains all the review routes that we have, all of them will be kept here and exported from here, so that app.js becomes less 
bulky, more modular and easier to understand for anyone. The routes on which this file sends requests are child routes, and the routes that 
are in the middleware in app.js are called the parent route.
*/

const express = require("express");
const router = express.Router({ mergeParams: true });

/*
Since we use a lot of objects and functionalities that are required in app.js in the code below, we have to require all of them here too, 
so that our server doesn't crash
*/
const wrapAsync = require("../utils/wrapAsync.js");
const { reviewSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressErrors.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

/*
  Here we have created a function validateReview that will be passed as a middleware, and it's work is to validate the reviews for our listings
  on the serverside, and make sure that they are not empty.
*/
const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// Reviews
/*
Since we have created reviews for each listing, which makes it a One to Many relation from the Listing to Reviews so the route for each review
must go through a listing id, and hence the route is of the following kind:- /listings/:id/reviews. We have passed our validateReview function
as a middleware to validate our reviews for the serverside and we have wrapped the function in wrapAsync so that error handling could be done
properly.
*/

// Post Review Route
router.post(
  "/",
  validateReview,
  wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    res.redirect(`/listings/${listing._id}`);
  })
);

// Delete Review Route
router.delete(
  "/:reviewId",
  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
  })
);

module.exports = router;
// Here we are exporting our router object for request matching in app.js
