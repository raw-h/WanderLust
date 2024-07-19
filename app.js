const express = require("express");
const path = require("path");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const methodOverride = require("method-override");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

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

app.listen(8080);

// Index Route
/* Here we are creating the index or the first page of our site, where all the listings will be shown, we take all the listings from the db
and store it in a variable called allListings and then the index.ejs template is rendered where values from that variable are used. */
app.get("/listings", async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
});

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
app.post("/listings", async (req, res) => {
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
  /* 
  The creation of object with key value pairs while taking values from user for new listing helps us in shortening the syntax for data
  extraction at this point. The data is obtained in the format of a JS object with the name of listing and it has required key value pairs.
  */
});

// Show Route (R operation in CRUD)
/* This route is used to show all the data related to one listing among all the listings.*/
app.get("/listings/:id", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/show.ejs", { listing });
});

// Update (U operation in CRUD)
/* Similar to create here also we will follow a 2 step approach for editing a listing in database.
    1. We will send a GET request to the Edit Route i.e /listings/:id/edit which will render a form for us and after making the edits, we
    will submit it.
    2. And that submission will send a POST request to the Update Route i.e /listings/:id where the data updation in the database will happen.
*/

// Edit Route
app.get("/listings/:id/edit", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
});
// update Route
app.put("/listings/:id", async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
});

// Delete Route (D operation in CRUD)
/*
We will have a Delete request on the route /listings/:id and the listing with the requested id will be deleted and removed from the DB.
*/
app.delete("/listings/:id", async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  res.redirect("/listings");
});

/* 
We had to put our New Route above our Show Route because in Show Route we obtain a get request that contains an id as it's parameters, but if
we had our New Route below the SHow Route then the /new in the New Route's get request would've been searched in the database as in id, and
hence having New below Show Route would've thrown an error.
*/

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
