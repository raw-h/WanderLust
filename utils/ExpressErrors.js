/* In our error handling middleware we are just sending a plain response for every kinds of error, but we can send different responses with 
different error codes and different status codes, for that purpose we have created this class.
*/

class ExpressError extends Error {
  constructor(statusCode, message) {
    super();
    this.statusCode = statusCode;
    this.message = message;
  }
}

module.exports = ExpressError;
