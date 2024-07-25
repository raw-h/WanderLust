/* This is a better implementation of try-catch block for error handling, this is the wrapAsync funtion (in form of an arrow function),
which takes input another function, the input function returns a fucntion that executes the function given as input to the wrapAsync function,
and the execution of this inner function is attached with the .catch() function which executes the next(). Using wrapAsync removes the redundancy
from our code of using try-catch again and again.
*/

module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
