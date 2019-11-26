// jshint esversion:6

// Setting up global constants/variables
let address = window.location.href; // Getting the web address
address = address.slice(0, address.length - 5); // Removing the '/chat' at the end of the address
const socket = io(address);
const chatBox = document.getElementById('chatBox');
const sendForm = document.getElementById('sendMessage');
const messageField = document.getElementById('message');
let username = '';

// Connecting to the socket
socket.on('welcomeMessage', function(data) {
  printMessage(data); // Prints the message showing that the user logged into the server
  username = $('.messageText').first().html().slice(0, $('.messageText').first().html().length - 18); // Saving user's username to a variable
  Object.freeze(username);
  socket.emit('newUser', username);
});

// Getting message from the server
socket.on('newMessage', function(data) {
  printMessage(data.username + ': ' + data.message);
});

// Sending the message from the client to the server
sendForm.addEventListener('submit', function(event) {
  event.preventDefault(); // Prevents the page from posting to the server and refreshing
  const message = messageField.value;
  socket.emit('clientMessage', message); // Sends the content of the message to the server
  printMessage('You: ' + message);
  messageField.value = ''; // Setting the message input field to an empty string
});

// Printing the message on the screen
function printMessage(message) {
  const messageDiv = document.createElement('div'); // Creates the div element where the message is going to be printed
  messageDiv.setAttribute('class', 'messageText'); // Gives a class to the element
  messageDiv.innerText = message; // Adds the actual text to the message
  chatBox.append(messageDiv); // Appends the element to the chat box
}
