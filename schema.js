/* This is a schema defined using JOI, this schema is not for mongoose, this is for our server side schema validation.
 */

const Joi = require("joi");

module.exports.listingSchema = Joi.object({
  // Inside Joi we will get an object, and the name of this object will be listing
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
    price: Joi.number().required().min(0), // It means the minimum value should be 0, it prevents from any negative integer from being entered.
    image: Joi.string().allow("", null), // It means that the image value is not necessarily required,
    // this field is allowed to have "" (i.e an empty string) and null value.
  }).required(), // It means that listing is an object and .required() is used to set it as a required parameter in requests.
});
