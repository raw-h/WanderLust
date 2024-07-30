const express = require("express");
const path = require("path");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressErrors.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

main()
  .then()
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.engine("ejs", ejsMate);

app.listen(8080);

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

// Root Route
/* This is the root directory or route of our project. */
app.get("/", (req, res) => {
  res.send("This is the root page");
});

// Index Route
/* Here we are creating the index or the first page of our site, where all the listings will be shown, we take all the listings from the db
and store it in a variable called allListings and then the index.ejs template is rendered where values from that variable are used. */
app.get(
  "/listings",
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
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});
// Create Route
app.post(
  "/listings",
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
app.get(
  "/listings/:id",
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
app.get(
  "/listings/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
  })
);
// update Route
app.put(
  "/listings/:id",
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
app.delete(
  "/listings/:id",
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

// Reviews
/*
Since we have created reviews for each listing, which makes it a One to Many relation from the Listing to Reviews so the route for each review
must go through a listing id, and hence the route is of the following kind:- /listings/:id/reviews. We have passed our validateReview function
as a middleware to validate our reviews for the serverside and we have wrapped the function in wrapAsync so that error handling could be done
properly.
*/

// Post Review Route
app.post(
  "/listings/:id/reviews",
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
app.delete(
  "/listings/:id/reviews/:reviewId",
  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
  })
);

/*This is a standard respose which will be generated when none of the above paths are matched with the incoming requests, then the following
response/error will be generated. * means for all the incoming requests that have not been matched. */
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

/* Even though we have handled form validations from the client side, there are still chances of encountering errors, while performing 
async functions related to the database, to handle those we define the following Error Handling Middleware. If we don't handle these errors
our server would crash and it would stop working completely. */

app.use((err, req, res, next) => {
  /* res.send("Something went wrong!");
  The above response would be thrown for any kind of error that occurs, but to give out status codes with specific messages, for that we
  need to use the ExpressError class that we have imported.
  */
  let { statusCode = 500, message = "SOmething went wrong!" } = err;
  // 500 and Something went wrong! are the default values in case a valid statusCode or message was not extracted from err.
  // res.status(statusCode).send(message);
  res.status(statusCode).render("error.ejs", { message });
});

// Code used for initial testing
// app.get("/testListing", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "My New Villa",
//     description: "By the beach",
//     price: 1200,
//     location: "Calangut, Goa",
//     country: "India",
//   });
//   await sampleListing.save();
//   console.log("Sample was saved");
//   res.send("Successful testing");
// });
