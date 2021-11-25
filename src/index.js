const express = require("express");
require("./db/mongoose");
const userRouter = require("./router/users");
const taskRouter = require("./router/tasks");

// Initializing Express JS
const app = express();

// Assigning port to server
const port = process.env.PORT;

// Maintaining Data Type for API's
app.use(express.json());

//******** Express COMMENTS ********//
// Without Middleware:___ new request -> run route handler
// With Middleware:___ new request -> do something -> run route handler

// app.use((req, res, next) => {
//   if (req.method === "GET") {
//     res.send("GET Requests are disabled!");
//   } else {
//     next();
//   }
// });

// Maintenance Middleware
// app.use((req, res, next) => {
//   res.status(503).send("Site undermaintenance, Please try again later!!");
// });

//******** END Express COMMENTS ********//

// Assiging Routings for API's
app.use(userRouter, taskRouter);

// Starting Server on Given port
app.listen(port, () => {
  console.log("Server is up on port: " + port);
});

const myFunction = async () => {};

myFunction();
