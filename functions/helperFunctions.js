//object to store url info
let urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "userRandomID",
  },
  lol123: {
    longURL: "https://www.neopets.com",
    userID: "user2RandomID",
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
function getUserByEmail(users, email) {
  for (const userKey in users) {
    if (users[userKey].email === email) {
      return users[userKey];
    }
  }
  return null;
}

function checkIfLoggedIn(req, res, next) {
  //check to see if user_id cookie is already stored
  if (req.session.user_id) {
    //if cookie is found, user is logged in. Redirect to /urls.
    res.redirect('/urls');
  } else {
    // if cookie found, proceed to the next route handler
    next();
  }
}

function checkIfNotLoggedIn(req, res, next) {
  //check to see if user_id cookie is not already stored
  if (!req.session.user_id) {
    //if cookie is not found,redirect to /urls.
    res.redirect('/login');
  } else {
    next();
  }
}

function urlsForUser(id) {
  //define object for user specific urls 
  let userUrls = {};
  //if id matches is in urlsDatabse, add that urlID to userURLs
  for (let urlID in urlDatabase) {
    if (urlDatabase[urlID].userID === id) {
      userUrls[urlID] = urlDatabase[urlID];
    }
  }
  return userUrls;
}

function doesURLBelongToUser(req, res, next) {
  //check if URL belong to logged in user 
  const userID = req.session.user_id;
  const urlID = req.params.id;
   //display HTML error message user is not logged in
  if (!userID) {
    return res.send('You must be logged in to view URLs.');
  }
   //display HTML error message user does not own URL
  if (urlDatabase[urlID].userID !== userID) {
    res.send('You do not have permission to view URLs.');
  } else {
    next();
  }
}

module.exports = {
  urlDatabase,
  users,
  generateRandomString,
  generateRandomID,
  getUserByEmail,
  checkIfLoggedIn,
  checkIfNotLoggedIn,
  urlsForUser,
  doesURLBelongToUser,
};