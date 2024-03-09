const { assert } = require('chai');

const { getUserByEmail } = require('../functions/helperFunctions.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail(testUsers, "user@example.com");
    const expectedUserID = "userRandomID";
   
    assert.deepEqual(user.id, expectedUserID, `Expected user ID is ${expectedUserID}, recieved user ID ${user.id}!`);
  });

  it('should return null if email is non-existant', function() {
    const user = getUserByEmail(testUsers, "bilbo@bagend.com");

    assert.deepEqual(user, null, "Email was not found in users Database");
  });
});