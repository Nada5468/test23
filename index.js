const express = require("express");
const app = express();
const http = require("http");
const bcrypt = require("bcryptjs");

var Messages = require("./msg.js");
const User = require("./user.js");

const server = http.Server(app);

const socketio = require("socket.io");
const io = socketio(server);

var PORT = process.env.PORT || 3000;

server.listen(PORT, function () {
  console.log("Listening to PORTv " + PORT);
});

//This code requires mongoose node module
var mongoose = require("mongoose");

//connecting local mongodb database named test
mongoose.connect("mongodb://127.0.0.1:27017/test").then(() => console.log("connect correctly to mongo database"));
//testing connectivity
mongoose.connection.once("connected", function () {
  console.log("Database connected successfully");
});

//var userRouter = require('./users.js');
//app.use('/',userRouter);

//chatRoom
var numUsers = 0;

//function to be executed when new user connects connection method
io.on("connection", function (socket) {
  console.log("a new socket has connected");
  var addedUser = false;

  //new message is sent
  socket.on("new message", function (data) {
    console.log("In function new message");
    console.log(data);

    Messages.create({
      name: "khaled",
      message: data,
    })
      .then((object) => console.log("message saved to mongo succesfully"))
      .catch((err) => console.log(err));

    //show new message to all clients
    socket.broadcast.emit("new message", {
      username: socket.username,
      message: data,
    });
  });

  //new user is added
  socket.on("add user", async function (user, data) {
    let username = user.split("\n")[0]
    let password = user.split("\n")[1]
    //console.log(password);
    //console.log(password.length);
    
    if(password.length <= 4){
    throw new Error("password must be at least 5 characters")}
    
    try {
      let foundUser = await User.findOne({ username });
      let DechashedPassword = await bcrypt.compare(password, hashedPassword);
      console.log(DechashedPassword);
      if (foundUser && DechashedPassword) {

        throw new Error("user already taken");
      }
      if (!password) {
        throw new Error("please insert a password");
      }
      let salt = await bcrypt.genSalt(10);
      let hashedPassword = await bcrypt.hash(password, salt);
      await User.create({
        username: username,
        password: hashedPassword,
      //  message: data,
      });
      console.log("user saved to mongo succesfully");
      socket.username = username;
      numUsers++;
      addedUser = true;
      console.log(username + " has joined");
      console.log(password + " Will be Hashed");
      console.log("The Hashed is   " + hashedPassword );

      //login the user and send the number of users
      socket.emit("login", {
        numUsers: numUsers,
      });

      //also echo to all clients that the server has connected
      socket.broadcast.emit("user joined", {
        username: socket.username,
        numUsers: numUsers,
      });
    } catch (error) {
      console.log(error);
    }
  });

  //A client starts typing
  socket.on("typing", function () {
    console.log("typing");
    //broadcast to all clients
    socket.broadcast.emit("typing", {
      username: socket.username,
    });
  });

  //Client stops typing
  socket.on("stop typing", function () {
    console.log("stoped typing");
    socket.broadcast.emit("stop typing", {
      username: socket.username,
    });
  });

  //Client disconnects
  socket.on("disconnect", function () {
    console.log("in function disconnect");
    if (addedUser === true) {
      numUsers--;

      //echo globally that user has dissconnected
      socket.broadcast.emit("user left", {
        username: socket.username,
        numUsers: numUsers,
      });
    }
  });
});
