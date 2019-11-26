// jshint esversion:6

// Setting up PORT
const port = process.env.PORT || 3000;

// Requiring Packages
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const mongoose = require('mongoose');


// Configuring app constants and settings
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

// Server constants
let tempName = ''; // Variable that temporarily saves the username of the user that just logged in
const users = {}; // Object that saves the usernames of the users and according to their socket.id

// Connecting to MongoDB/mongoose
mongoose.connect('mongodb://localhost:27017/dgUserDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
});

// Creating Schemas
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'You must enter an Username.']
  },
  email: {
    type: String,
    required: [true, 'You must enter an email']
  }
});

// Creating Models
const User = new mongoose.model('User', userSchema);


// Setting up 'home' chained route
app.route('/')

  // setting up get request
  .get(function(req, res) {
    res.redirect('/login');
  });

// Setting up the '/login' Route
app.route('/login')

  // setting up get request
  .get(function(req, res) {
    res.render('login');
  })

  // Setting up post request
  .post(function(req, res) {
    // Loggin in the user using the email address
    User.findOne({
      email: req.body.email
    }, function(err, foundUser) {
      if (err) {
        console.log(err);
      } else {
        if (foundUser) {
          tempName = foundUser.username;
          res.redirect('chat');
          console.log(foundUser);
        } else {
          res.redirect('/login');
        }
      }
    });
  });

// Setting up '/signup' chained route
app.route('/signup')

  // Setting up get request
  .get(function(req, res) {
    res.render('signup');
  })

  // Setting up post request
  .post(function(req, res) {
    // Registering a new user
    const user = new User({
      username: req.body.username,
      email: req.body.email
    });
    user.save(function(err) {
      if (err) {
        console.log(err);
        res.redirect('/signup');
      } else {
        tempName = user.username;
        res.redirect('chat');
      }
    });
  });

// Setting up '/chat' chained route
app.route('/chat')

  // Setting up get request
  .get(function(req, res) {
    // Only renders the '/chat' page if the user logged in (the 'tempName variable has a value')
    if (tempName === '') {
      res.redirect('/login');
    } else {
      res.render('chat');
    }
  });

// Setting up chat server
io.on('connection', function(socket) {
      // Sending welcome message
      io.emit('welcomeMessage', tempName + ' entered the room.');
      tempName = '';

      // Recieving client Usernames
      socket.on('newUser', function(username) {
        users[socket.id] = username; // Saves the user name into the 'users' object
      });

      // Recieving messages from client and boradcasting them
      socket.on('clientMessage', function(message) {
          socket.broadcast.emit('newMessage', {
              message: message,
              username: users[socket.id]}); // Sending message to everyone connected to the server
          });
      });

    // Setting up listening port
    server.listen(port, function() {
      console.log('App running on port ' + port + '.');
    });
