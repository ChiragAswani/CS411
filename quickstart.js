var pug = require('pug');
var express= require('express');
var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var promise = require('promise');
var cookieParser = require('cookie-parser');

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
 
// Connection URL
const url = 'mongodb://localhost:27017';
 
// Database Name
const dbName = 'socialite';

var global_username = '';

 
// Use connect method to connect to the server


const insertAuthDocuments = function(db, data, callback) {
  // Get the documents collection
  const collection = db.collection('authentication');
  // Insert some documents
  collection.insertMany([data], function(err, result) {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    assert.equal(1, result.ops.length);
    console.log("Inserted document into authentication collection");
    callback(result);
  });
}

const insertUserDocuments = function(db, data, callback) {
  // Get the documents collection
  const collection = db.collection('user_preferences');
  // Insert some documents
  collection.insertMany([data], function(err, result) {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    assert.equal(1, result.ops.length);
    console.log("Inserted document into user_preferences collection");
    callback(result);
  });
}

var SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'calendar-nodejs-quickstart.json';

var app = express();
app.use(cookieParser());

app.get("/", function(req, res){
  res.sendFile(__dirname + "/pages/welcome_v1.html")
});



app.get("/signup", function(req, res){
  res.sendFile(__dirname + "/pages/signup_v1.html")
});

app.get("/login", function(req, res){
  //res.clearCookie("chiraga");
  if(req.cookies == null){
    res.sendFile(__dirname + "/pages/login_v1.html")
  }
  else{
    res.sendFile(__dirname + "/pages/test.html")
  }
  
})

app.get("/createaccount", function(req, res){
  global_username = req.query.username;
  req.query = {'username': req.query.username, 'password':req.query.password[0]}
  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    console.log("Connected correctly to server");
    const db = client.db(dbName);
    insertAuthDocuments(db, req.query, function() {global_username});
  });
  res.sendFile(__dirname + "/pages/userinput.html")
})


app.get("/submit", function(req, res){
  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    console.log("Connected correctly to server");
    const db = client.db(dbName);
    db.collection("authentication").findOne({username: req.query.username, password: req.query.password}, function(err, result) {
      if (err) throw err;
      if (result == null){
        res.sendFile(__dirname + "/pages/login_v1.html")
      }
      else{
        console.log(result);
        res.cookie(req.query.username, req.query.password);
        res.sendFile(__dirname + "/pages/webpage_v1.html")

      }
      
    });
  });
  
})




app.get("/userinput", function(req, res){
  //var confirm = "reached";
  var user_preferences = req.query
  for (var key in user_preferences){
    if(user_preferences.hasOwnProperty(key)){
      console.log(user_preferences[key])
      if (typeof user_preferences[key] == 'string'){
        user_preferences[key] = [user_preferences[key]]
      }
    } 
  }
  var obj = {"username": global_username, user_preferences}
  MongoClient.connect(url, function(err, client) {
  assert.equal(null, err);
  console.log("Connected correctly to server");
  const db = client.db(dbName);
  insertUserDocuments(db, obj, function() {});
  res.sendFile(__dirname + "/pages/webpage_v1.html")
});
  
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback, res, numEvents) {
  console.log(credentials)
  var clientSecret = credentials.web.client_secret;
  var clientId = credentials.web.client_id;
  var redirectUrl = credentials.web.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client, res, numEvents);
      
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Lists the next 10 events on the user's primary calendar.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listEvents(auth, res, numEvents) {
  var calendar = google.calendar('v3');
  calendar.events.list({
    auth: auth,
    calendarId: 'primary',
    timeMin: (new Date()).toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime'
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var events = response.items;
    if (events.length == 0) {
      console.log('No upcoming events found.');
    } else {
      console.log('Upcoming events:');
      var data = '';
      for (var i = 0; i < numEvents; i++) {
        var event = events[i];
        try{
        	var start = event.start.dateTime || event.start.date;
        	//console.log('%s - %s', start, event.summary);
        	var line = `<p>${start} - ${event.summary}</p>`
        	data += line;	
        }
        catch(err){
        	console.log("failed this time")
        }
        
      }
      res.send(data);

    }
  });
}
app.listen(8000);
console.log('Listening on 8000')
