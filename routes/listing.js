/*
We have created this folder to use the functionalities of the Router object in JS, which helps make our code less bloated, by creating a
separate files for all the routes that we have in our site.
This file contains all the listing routes that we have, all of them will be kept here and exported from here, so that app.js becomes less 
bulky, more modular and easier to understand for anyone. The routes on which this file sends requests are child routes, and the routes that 
are in the middleware in app.js are called the parent route.
*/

const express = require("express");
const router = express.Router();

/*
Since we use a lot of objects and functionalities that are required in app.js in the code below, we have to require all of them here too, 
so that our server doesn't crash
*/
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressErrors.js");
const Listing = require("../models/listing.js");

/*
  Here we have created a function validateListing that will be passed as a middleware, it is created using our listingSchema created using Joi for 
  validating our server side schema, because even though we have validated our client side form but still we need to add a layer of validation 
  on the server side. Our listingSchema is validating each and every field of the listing object that goes to the server with the post request.
*/
const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    // There are a lot of details associated with our errors, inside the details object of an error, we can extract them using the line below.
    let errMsg = error.details.map((el) => el.message).join(",");
    /*
    For each element of the detail object inside error we are returning it's message, and we are joining all of those error messages using
    join function with the separator ","
    */
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// Index Route
/* Here we are creating the index or the first page of our site, where all the listings will be shown, we take all the listings from the db
and store it in a variable called allListings and then the index.ejs template is rendered where values from that variable are used. */
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  })
);

// Create (C operation in CRUD)
/* Here we will follow a 2 step approach for creating a listing and inserting it in database.
    1. We will send a GET request to the New Route i.e /listings/new which will render a form for us and after entering the asked data, we
    will submit it.
    2. And that submission will send a POST request to the Create Route i.e /listings where the data insertion in the database will happen.
*/

// New Route
router.get("/new", (req, res) => {
  res.render("listings/new.ejs");
});
// Create Route
router.post(
  "/",
  validateListing, //Passing the function for server side schema validation as a middleware
  wrapAsync(async (req, res, next) => {
    // Enclosing the await code in a try catch block is one of the ways to handle errors after implementing a error handling middleware.
    // try {
    //   const newListing = new Listing(req.body.listing);
    //   await newListing.save();
    //   res.redirect("/listings");
    // } catch (err) {
    //   next(err);
    // }

    // if (!req.body.listing) {
    //   throw new ExpressError(400, "Send valid data for listing!");
    //   // Here if the listing comes empty from client side then this error will be thrown, saying it was a bad request,
    //   // and the above message will be displayed.
    // }
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
    /* 
  The creation of object with key value pairs while taking values from user for new listing helps us in shortening the syntax for data
  extraction at this point. The data is obtained in the format of a JS object with the name of listing and it has required key value pairs.
  */
  })
);

// Show Route (R operation in CRUD)
/* This route is used to show all the data related to one listing among all the listings.*/
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", { listing });
  })
);

// Update (U operation in CRUD)
/* Similar to create here also we will follow a 2 step approach for editing a listing in database.
    1. We will send a GET request to the Edit Route i.e /listings/:id/edit which will render a form for us and after making the edits, we
    will submit it.
    2. And that submission will send a POST request to the Update Route i.e /listings/:id where the data updation in the database will happen.
*/

// Edit Route
router.get(
  "/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
  })
);
// update Route
router.put(
  "/:id",
  validateListing,
  wrapAsync(async (req, res) => {
    // if (!req.body.listing) {
    //   throw new ExpressError(400, "Send valid data for listing!");
    //   // Here if the listing comes empty from client side then this error will be thrown, saying it was a bad request,
    //   // and the above message will be displayed.
    // }
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
  })
);

// Delete Route (D operation in CRUD)
/*
We will have a Delete request on the route /listings/:id and the listing with the requested id will be deleted and removed from the DB.
*/
router.delete(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
  })
);

/* 
We had to put our New Route above our Show Route because in Show Route we obtain a get request that contains an id as it's parameters, but if
we had our New Route below the Show Route then the /new in the New Route's get request would've been searched in the database as in id, and
hence having New below Show Route would've thrown an error.
*/

module.exports = router;
// Here we are exporting our router object for request matching in app.js
