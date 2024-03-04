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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
    username: req.cookies["username"], // passes username urls index page
    urls: urlDatabase,
  };
  // render url_index template to display info in templateVars to client
  res.render("urls_index", templateVars);
});

//render template in urls_new/.ejs in browser
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"], // passes username urls/new page
  };
  res.render("urls_new", templateVars);
});

//handle from submssion to create and save shortURL
app.post("/urls", (req, res) => {
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

//create username, store username in 'username' cookie
app.post("/login", (req, res) => {
  const { username } = req.body;
  //set cookie named 'username'
  res.cookie('username', username);
  res.redirect("/urls");
});

//implement logout by clearing username cookie
app.post("/logout", (req, res) => {
  res.clearCookie('username');
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
    username: req.cookies["username"] // passes username to display to user
  };
  //pass templateVars containing single URL and it's shortened form to urls_show to diplay to client
  res.render("urls_show", templateVars);
});

//render register template 
app.get("/register", (req, res) => {
  const templateVars = {
    username: req.cookies["username"], // passes username urls/new page
  };
  res.render("register", templateVars);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
