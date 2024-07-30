/*
All the Models are stored inside the models folder

Listing (Model):- Listing is a palce (could be an apartment, flat, house, villa, hotel) that somebody is providing for other people to stay, 
and this model will contain the lising as well as other necessary information related to it, such as where is it, how much will it cost,
what other facilities we get, some images, some description etc. 

The model will have the following informations:-
    1. title (String)
    2. description (String)
    3. image (URL) (String)
    4. price (Number)
    5. location (String)
    6. country (String)
*/

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    type: String,
    default: "https://unsplash.com/photos/white-flower-9m5z1my-xZs",
    set: (v) =>
      v === "" ? "https://unsplash.com/photos/white-flower-9m5z1my-xZs" : v,
  },
  price: Number,
  location: String,
  country: String,
  /*
  Reviews is an array, which will store objects, and those objects will be of type ObjectId, and the reference will be Review schema. 
  */
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

/*
We have our post mongoose middleware which we are using to achieve cascading delete for the case where we delete a listing, and we want all
the reviews related to it to get deleted by themselves, this middleware will work on findOneAndDelete, and the async function in it will take
the listing as it's data 
*/
listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;

/*
Here we have created our listing schema, we imported mongoose, then we created a variable named Schema so that we don't have to type
mongoose.Schema everywhere.

Then we created the schema where the structure of all the documents (i.e Listings) is defined.
Here we used the "set" schematype option which is used to set a property and it has a callback function where one ternary operator is 
used to set the value for image if it has been given by the user or to a default value if it is not supplied by a user.
We have also set a default value when the value for image does not exist, and set checks that we have an image but the link is empty,
the set condition has been set up for clients/users and default is for the case when we do not have any image but for the testing to go smooth. 

Moving forward we created a model named "Listing" using the freshly created listingSchema.

And the last statement is for exporting the module. 
*/
