const express = require("express");
const path = require("path");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressErrors.js");
const listings = require("./routes/listing.js"); //Requiring listing.js which contains all the request routes for our listing.
const reviews = require("./routes/review.js"); //Requiring listing.js which contains all the request routes for our listing.

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

app.use("/listings", listings); //A middleware, which matches all the requests for "/listings" with the second parameter i.e listings
app.use("/listings/:id/reviews", reviews); //A middleware, which matches all the requests for "/reviews" with the reviews
/*
  In the above middleware for reviews, it won't send any id in the parameter, this is because, the id parameter on which the request is sent 
  gets left behind in this(app.js) file itself, and only the parameters that are after the(/listings/:id/reviews) path are sent to the
  (review.js) file in routes folder. To make sure that the id parameter doesn't get stuck in the file, and the parameters of parent route gets 
  attached to the child route we use the option mergeParams, where we have used the Router object in the top of our file.
*/

// Root Route
/* This is the root directory or route of our project. */
app.get("/", (req, res) => {
  res.send("This is the root page");
});

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
