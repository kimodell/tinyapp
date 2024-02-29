const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

//set EJS as view engine
app.set("view engine", "ejs");

//function to parse bodyfor POST from a Buffer to a string
app.use(express.urlencoded({ extended: true }));

//generate random string of 6 alphanumeric characters to create shortURL ID
function generateRandomString() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let newString = "";
  for (let i = 0; i < 6; i++) {
    newString += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return newString;
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

//route handler to display entire urlDatabase in /urls
app.get("/urls", (req, res) => {
  //pass urlDatabase info to templateVars
  const templateVars = { urls: urlDatabase };
  // pass URL data to rendered url_index template to display to client
  res.render("urls_index", templateVars);
});

//route to render template in urls_new/.ejs in browser
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//route to handle from submssion to create shortURL and save it in urlDatabase
app.post("/urls", (req, res) => {
  //generate random ID to be used as shortURL
  const id = generateRandomString();
  // stores longURL
  const { longURL } = req.body
  //add key:value pair of  id:longURL to database
  urlDatabase[id] = longURL
  //redirects used to new page with new short URL
  res.redirect(`/urls/${id}`);
});

//route to handle shortURL requests so clicking the id/shortURL will redirect to it's longURL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

//route handler to display single URL from urlDatabase and its shortURL (id)
app.get("/urls/:id", (req, res) => {
  //pass longURL and url ID to templateVars object
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  //pass templateVars containing single URL and it's shortened form to urls_show to diplay to client
  res.render("urls_show", templateVars);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
