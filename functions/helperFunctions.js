//object to store url info
let urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
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
  return ;
}

function checkIfLoggedIn(req, res, next) {
  //check to see if user_id cookie is already stored
  if (req.cookies.user_id) {
    //if cookie is found, user is logged in. Redirect to /urls.
    res.redirect('/urls');
  } else {
    // if cookie found, proceed to the next route handler
    next();
  }
}

function checkIfNotLoggedIn(req, res, next) {
  //check to see if user_id cookie is not already stored
  if (!req.cookies.user_id) {
    //if cookie is not found,redirect to /urls.
    res.redirect('/login');
  } else {
    next();
  }
}


module.exports = {
  urlDatabase,
  users,
  generateRandomString,
  generateRandomID,
  findUserWithEmail,
  checkIfLoggedIn,
  checkIfNotLoggedIn,
};