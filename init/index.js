const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("Connected to DB.");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});
  await Listing.insertMany(initData.data);
  console.log("Data was initialised");
};

initDB();
/*
We have all the initialisation logic here, we require the necessary modeules, establish a connection with the database, we clean all the
previous data from the databaseand then we insert the data for initialisation.
initData is an object in itself and from this object we want to access the value for the key data.

At last we call the initDB function, we have to simply run this file using node not nodemon.
*/
