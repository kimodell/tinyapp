const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const { urlDatabase, users, generateRandomString, generateRandomID, getUserByEmail, checkIfLoggedIn, checkIfNotLoggedIn, urlsForUser, doesURLBelongToUser } = require('./functions/helperFunctions');


//set EJS as view engine
app.set("view engine", "ejs");

//parse body for POST from a Buffer to a string
app.use(express.urlencoded({ extended: true }));
//parses cookie to display tp user
//app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));


app.get("/", (req, res) => {
  res.send("Hello!");
});

//additional endpoints
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//additional response containing HTML code to be rendered in client browser
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//display entire urlDatabase in /urls
app.get("/urls", (req, res) => {
  //set userId from userId in cookies
  const userId = req.session.user_id;

  //if no userId, redirect user to login page
  if (!userId) {
    return res.redirect("/login");
  }
  //call urlsForUser function with current logged in user's id
  const userUrls = urlsForUser(userId);

  //pass urlDatabase info to templateVars
  const templateVars = {
    user: users[req.session.user_id], // passes user to urls index page
    urls: userUrls,
  };
  // render url_index template to display info in templateVars to client
  res.render("urls_index", templateVars);
});

//render template in urls_new/.ejs in browser
app.get("/urls/new", checkIfNotLoggedIn, (req, res) => {
  const templateVars = {
    user: users[req.session.user_id], // passes user to urls/new page
  };
  res.render("urls_new", templateVars);
});

//handle from submssion to create and save shortURL
app.post("/urls", (req, res) => {

  //display HTML error message used is not logged in
  if (!req.session.user_id) {
    return res.send('You must be logged in to shorten URLs.');
  }

  //generate random ID to be used as shortURL
  const id = generateRandomString();
  // defines longURL
  const { longURL } = req.body;
  //add key:value pair of  id:longURL to database
  urlDatabase[id] = {
    longURL: longURL,
    userID: req.session.user_id
  };
  //redirects used to new page with new short URL
  res.redirect(`/urls/${id}`);
});

//delete specific existing shortened URL from database
app.post("/urls/:id/delete", (req, res) => {
  const userID = req.session.user_id;
  //assign user id for logged in user to allow for deletion 
  const userCanDelete = req.params.id;

  const urlID = urlDatabase[userCanDelete];

  //display HTML error message url does not exist
  if (!urlID) {
    return res.send('Invalid URL');
  }

  //display HTML error message if user does not own URL
  if (urlID.userID !== userID) {
    return res.send('You do not have permission to view URL');
  } else { //user can delete if user owns url
    delete urlDatabase[userCanDelete];
  }

  //redirect user back to urls index page
  res.redirect("/urls");
});

//update specific longURL based on ID selected by user
app.post("/urls/:id/update", (req, res) => {
  const id = req.params.id;
  const { newLongURL } = req.body;
  const userID = req.session.user_id;

  const urlID = urlDatabase[id];

  //display HTML error message url does not exist
  if (!urlID) {
    return res.send('Invalid URL');
  }

  //display HTML error message if user does not own URL
  if (urlID.userID !== userID) {
    return res.send('You do not have permission to edit URL');
  } else { //update longURL in urlDatabase based on ID
    urlDatabase[id].longURL = newLongURL;
  }

  res.redirect("/urls");
});

//render login template, check to ensure user is not already lodding in before rendering
app.get("/login", checkIfLoggedIn, (req, res) => {
  const templateVars = {
    user: users[req.session.user_id], // passes user to login page
  };
  res.render("login", templateVars);
});

//login with email and password
app.post("/login", (req, res) => {
  //extract email and password from the request body
  const { email, password } = req.body;

  //if email is not registered to a user, return 403 status code
  const user = getUserByEmail(users, email);

  if (!user) {
    return res.status(403).send("Invalid login");
  }

  //check if password is the same as password for user with corresponding email
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Invalid bcrypt login");
  }

  //if email and password are correct, store cookie to login
  //res.cookie('user_id', user.id);
  req.session.user_id = user.id;
  res.redirect("/urls");
});

//implement logout by clearing user_id cookie
app.post("/logout", (req, res) => {
  //clear cookie by logging out or closing session
  req.session = null;
  res.redirect("/login");
});

//render register template, check to ensure user is not already lodding in before rendering
app.get("/register", checkIfLoggedIn, (req, res) => {
  const templateVars = {
    user: users[req.session.user_id], // passes user to urls/new page
  };
  res.render("register", templateVars);
});

//handle from submssion to create and save registration
app.post("/register", (req, res) => {
  //generate random userId
  const userId = generateRandomID();
  //extract email and password from the request body
  const { email, password } = req.body;
  //save hash of password
  const hashedPassword = bcrypt.hashSync(password, 10);

  //check if email or password is empty
  if (!email || !password) {
    return res.status(400).send("Email and password cannot be blank.");
  }
  //if email already exists, return status code 400
  if (getUserByEmail(users, email)) {
    return res.status(400).send("Email already registered.");
  }

  //create new user in the users object
  users[userId] = {
    id: userId,
    email: email,
    password: hashedPassword
  };

  //set cookie for user_id to login
  //res.cookie('user_id', userId);
  req.session.user_id = userId;
  res.redirect("/urls");
});

//handle shortURL requests to redirect shortURL click to longURL
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id].longURL;
  //display HTML error message if is does not exist
  if (urlDatabase[id] === undefined) {
    return res.send('TinyURL does not exist.');
  }
  res.redirect(longURL);
});


//display single URL from urlDatabase
app.get("/urls/:id", doesURLBelongToUser, (req, res) => {
  const id = req.params.id;
  //pass longURL and url ID to templateVars object
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[id].longURL,
    user: users[req.session.user_id] // passes user_id to display to user
  };
  //pass templateVars containing single URL and it's shortened form to urls_show to diplay to client
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
