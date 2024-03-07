const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");

//set EJS as view engine
app.set("view engine", "ejs");

//parse body for POST from a Buffer to a string
app.use(express.urlencoded({ extended: true }));
//parses cookie to display tp user
app.use(cookieParser());

//generate random string to create shortURL ID
function generateRandomString() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";
  for (let i = 0; i < 6; i++) {
    randomString += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return randomString;
}

//generate random user ID
function generateRandomID() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";
  for (let i = 0; i < 6; i++) {
    randomString += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return randomString;
}
//check if email already registered
function findUserWithEmail(users, email) {
  for (const userKey in users) {
    if (users[userKey].email === email) {
      return users[userKey];
    }
  }
  return false;
}

function checkIfLoggedIn(req, res, next) {
  //chek to see if user_id cookie is already stored
  if (req.cookies.user_id) {
    //if cookie is found, user is logged in. Redirect to /urls.
    res.redirect('/urls');
  } else {
    // if cookie found, proceed to the next route handler
    next();
  }
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//object to store user registration data
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "a@a.com",
    password: "1234",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "b@b.com",
    password: "5678",
  },
};

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
  //pass urlDatabase info to templateVars
  const templateVars = {
    user: users[req.cookies.user_id], // passes user to urls index page
    urls: urlDatabase,
  };
  // render url_index template to display info in templateVars to client
  res.render("urls_index", templateVars);
});

//render template in urls_new/.ejs in browser
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id], // passes user to urls/new page
  };

  //redirect to login page if user is not logged in
  if (!req.cookies.user_id) {
    res.redirect('/login');
  } else {
    res.render("urls_new", templateVars);
  }
});

//handle from submssion to create and save shortURL
app.post("/urls", (req, res) => {
  
  if (!req.cookies.user_id) {
    return res.send('<html><body><p>You must be logged in to shorten URLs. Please <a href="/login">login</a> or <a href="/register">register</a>.</p></body></html>');
  }

  //generate random ID to be used as shortURL
  const id = generateRandomString();
  // defines longURL
  const { longURL } = req.body;
  //add key:value pair of  id:longURL to database
  urlDatabase[id] = longURL;
  //redirects used to new page with new short URL
  res.redirect(`/urls/${id}`);
});

//delete specific existing shortened URL from database
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  //redirect user back to urls index page
  res.redirect("/urls");
});

//update specific longURL based on ID selected by user
app.post("/urls/:id/update", (req, res) => {
  const { newLongURL } = req.body;
  //update longURL in urlDatabase based on ID
  urlDatabase[req.params.id] = newLongURL;
  res.redirect("/urls");
});

//render login template, check to ensure user is not already lodding in before rendering
app.get("/login", checkIfLoggedIn, (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id], // passes user to login page
  };
  res.render("login", templateVars);
});

//login with email and password
app.post("/login", (req, res) => {
  //extract email and password from the request body
  const { email, password } = req.body;

  //if email is not registered to a user, return 403 status code
  const user = findUserWithEmail(users, email);
  if (!user) {
    return res.status(403).send("Invalid login");
  }

  //check if password is the same as password for user with corresponding email
  if (user.password !== password) {
    return res.status(403).send("Invalid login");
  }

  //if email and password are correct, store cookie to login
  res.cookie('user_id', user.id);
  res.redirect("/urls");
});

//implement logout by clearing user_id cookie
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/login");
});

//render register template, check to ensure user is not already lodding in before rendering
app.get("/register", checkIfLoggedIn, (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id], // passes user to urls/new page
  };
  res.render("register", templateVars);
});

//handle from submssion to create and save registration
app.post("/register", (req, res) => {
  //generate random userId
  const userId = generateRandomID();
  //extract email and password from the request body
  const { email, password } = req.body;

  //check if email or password is empty
  if (!email || !password) {
    return res.status(400).send("Email and password cannot be blank.");
  }
  //if email already exists, return status code 400
  if (findUserWithEmail(users, email)) {
    return res.status(400).send("Email already registered.");
  }

  //create new user in the users object
  users[userId] = {
    id: userId,
    email: email,
    password: password
  };

  //set cookie for user_id to login
  res.cookie('user_id', userId);
  res.redirect("/urls");
});

//handle shortURL requests to redirect shortURL click to longURL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});


//display single URL from urlDatabase
app.get("/urls/:id", (req, res) => {
  //pass longURL and url ID to templateVars object
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies.user_id] // passes user_id to display to user
  };
  //pass templateVars containing single URL and it's shortened form to urls_show to diplay to client
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
