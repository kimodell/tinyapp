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
  const templateVars = { urls: urlDatabase };
  // pass URL data to rendered url_index template to display to client
  res.render("urls_index", templateVars);
});

//route handler to display single URL from urlDatbase and its shortened form (ID)
app.get("/urls/:id", (req, res) => {
  //store the id/key as a variable
  const urlID = req.params.id;
  const templateVars = { id: req.params.id, longURL: urlDatabas[urlID] }
  //pass single URL and it's shortened form to urls_show to diplay to client
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});