const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

//set EJS as view engine
app.set("view engine", "ejs");

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

//route handler to display entire urlDatabase in /urls
app.get("/urls", (req, res) => {
  //pass urlDatabase info to templateVars
  const templateVars = { urls: urlDatabase };
  // pass URL data to rendered url_index template to display to client
  res.render("urls_index", templateVars);
});

//route handler to display single URL from urlDatabase and its shortened form (ID)
app.get("/urls/:id", (req, res) => {
  //pass longURL and url ID to templateVars object
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] }
  //pass templateVars containing single URL and it's shortened form to urls_show to diplay to client
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});