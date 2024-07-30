/*
Review (Model):- The review model will will have 3 fields at present and here people will be addig  their review about the place
and their experience and any other significant details they want to add, right now there is no model for users so anyone can put up a
review for a pace without any authentication or whatsoever.

The model will have the following informations:-
    1. comment (String)
    2. rating (1-5) (Number)
    3. createdAt (Date, Time)
*/

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  comment: String,
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Review", reviewSchema);
