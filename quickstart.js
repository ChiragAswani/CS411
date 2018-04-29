  //node modules
var pug = require('pug');
var express= require('express');
var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var promise = require('promise');
var cookieParser = require('cookie-parser');
var Twitter = require('twitter');
var Slack = require('slack');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
var passport = require('passport');
var Strategy = require('passport-twitter').Strategy;
var session = require('express-session');
var request = require('request')


passport.use(new Strategy({
    consumerKey: 'fSF2cv9DMbMcWjCJEkJ3IOn5R',
    consumerSecret: 's9qsB5kITvkO9OhHw1FEXkqSRJeYxH9Oar7mwKClv8k1vD3oLE',
    callbackURL: 'http://localhost:8000/authorizeTwitterReturn'
}, function(token, tokenSecret, profile, callback) {
    return callback(null, profile);
}))
passport.serializeUser(function(user, callback) {
    callback(null, user);
})

passport.deserializeUser(function(obj, callback) {
    callback(null, obj);
})
 
//Mongo Connections
const url = 'mongodb://localhost:27017';
const dbName = 'socialite';

//Global Variables
var global_username = '';

//Connections
var app = express();
app.use(cookieParser());
app.use(session({secret: 'whatever', resave: true, saveUninitialized: true}))
app.use(passport.initialize())
app.use(passport.session())
/* API clients */


// Use connect method to connect to the server


//Inserts username and password into mongo database
const insertAuthDocuments = function(db, data, callback) {
  const collection = db.collection('authentication');
  collection.insertMany([data], function(err, result) {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    assert.equal(1, result.ops.length);
    console.log("Inserted" + data + "Into" + "Mongo collection: authentication");
    callback(result);
  });
}


//Inserts user preferences into mongo database 
const insertUserDocuments = function(db, data, callback) {
  const collection = db.collection('user_preferences');
  collection.insertMany([data], function(err, result) {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    assert.equal(1, result.ops.length);
    console.log("Inserted" + data + "Into" + "Mongo collection: user_preferences");
    callback(result);
  });
}

//Sets default homepage to welcome_v1.html
app.get("/", function(req, res){

  res.sendFile(__dirname + "/pages/welcome_v1.html")
});

app.get("/messages_v1.html", function(req, res){
  console.log(global_username)
  res.sendFile(__dirname + "/pages/messages_v1.html")
});
app.get("/newsfeed_v1.html", function(req, res){
  console.log(global_username)
  res.sendFile(__dirname + "/pages/newsfeed_v1.html")
});
app.get("/calendar_v1.html", function(req, res){
  console.log(global_username)
  res.sendFile(__dirname + "/pages/calendar_v1.html")
});
app.get("/webpage_v1.html", function(req, res){
  console.log(global_username)
  res.sendFile(__dirname + "/pages/webpage_v1.html")
});
app.get("/app_selection_v1.html", function(req, res){
  console.log(global_username)
  res.sendFile(__dirname + "/pages/app_selection_v1.html")
});
//welcome_v1.html -> signup_v1.html
app.get("/signup", function(req, res){
  res.sendFile(__dirname + "/pages/signup_v1.html")
});
app.get("/middle.js", function(req, res){
  res.sendFile(__dirname + "/middle.js")
})

app.get("/accounts", function(req, res){
  MongoClient.connect(url, function(err, client) {
    accounts = []
    const db = client.db(dbName);
    db.collection("authentication").find({}, function(err, result){
      var cursor = result
      cursor.forEach(function(account){
        accounts.push(account)
        console.log(accounts)
      }, function(){
        res.send(accounts)
      })
      
    })
  })
})

app.get("/messages", function(req, res){


  
  var messages = {data:[{ platform: "<img src='https://png.icons8.com/cotton/2x/twitter.png' style='height:30px; width:30px'> <div hidden>Twitter</div>",
    sender_id: '2444364534',
    message: 'the quick brown fox jumps over the lazy diog',
    time_stamp: '20:16:15' },
  { platform: "<img src='http://www.icons101.com/icon_png/size_512/id_73479/Slack.png' style='height:30px; width:30px'> <div hidden>Slack</div>",
    sender_id: 'neilc234',
    message: 'test',
    time_stamp: '18:03:17' }]} 
  messages = JSON.stringify(messages)
  res.send(messages)
})

app.get("/goToWelcomePage", function(req, res){
  res.clearCookie("username");
  res.clearCookie("password");
  res.sendFile(__dirname + '/pages/welcome_v1.html')
})


/**
***Looks up cookie (username='',password='') in mongodb
***Valid Cookie: update cookie, go to webpage_v1.html
***Invalid Cookie: go to login_v1.html
**/

//welcome_v1.html -> login_v1.html
app.get("/login", function(req, res){
  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    db.collection("authentication").findOne({username: req.cookies.username, password: req.cookies.password}, function(err, result) {
      if (err) throw err;
      if (result == null){ //cookie not in db
        res.sendFile(__dirname + "/pages/login_v1.html")
      }
      else{ //cookie in db

        res.clearCookie("username");
    	  res.clearCookie("password");
        res.cookie("username", req.query.username);
        res.cookie("password", req.query.password);
        global_username = req.cookies.username
        console.log("Sucessfully logged in with cookies");
        res.sendFile(__dirname + "/pages/webpage_v1.html")
      }  
    });
  }); 
})

/**
***Creates an account by inserting the username and password into the mongo database
***Sets the username and password cookies
**/

//signup_v1.html -> userinput.html
app.get("/createaccount", function(req, res){
  global_username = req.query.username;
  console.log(global_username)
  req.query = {'username': req.query.username, 'password':req.query.password}
  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    insertAuthDocuments(db, req.query, function() {global_username});
    res.clearCookie("username");
    res.clearCookie("password");
    res.cookie("username", req.query.username);
    res.cookie("password", req.query.password);
    res.sendFile(__dirname + "/pages/app_selection_v1.html")
  });
  
})

/**
***Assumes that the username and password couldn't be read from the cookies
***Username and password exists: webpage_v1.html
***Username and password !exists: login_v1.html 
**/

//login_v1.html -> webpage_v1.html
app.get("/submit", function(req, res){
  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    db.collection("authentication").findOne({username: req.query.username, password: req.query.password}, function(err, result) {
      if (err) throw err;
      if (result == null){
        //username doesnt exist
        res.sendFile(__dirname + "/pages/login_v1.html")
      }
      else{
        res.clearCookie("username");
        res.clearCookie("password");
        res.cookie("username", req.query.username);
        res.cookie("password", req.query.password);
        global_username = req.query.username
        res.sendFile(__dirname + "/pages/webpage_v1.html")

      }
      
    });
  });
  
})





app.get("/goToAppSelection", function(req, res){
  res.sendFile(__dirname + "/pages/app_selection_v1.html")
})
app.get("/authorizeGoogle", function(req, res){
  res.sendFile(__dirname + "/pages/adsfadsfs.html")
})

app.get('/authorizeTwitter', passport.authenticate('twitter'))

app.get('/authorizeTwitterReturn', function(req, res){
  res.sendFile(__dirname + "/pages/app_selection_v1.html")
})

app.get('/authorizeSlack', function(req, res){
  res.redirect('https://slack.com/oauth/authorize?client_id=309091349812.353983200660&scope=commands,channels:history,channels:read,channels:write,chat:write,users.profile:read,users.profile:write,users:read,users:read.email,users:write')
})

app.get('/authorizeSlackReturn', function(req, res){
  res.sendFile(__dirname + "/pages/app_selection_v1.html")
})

function convert_unix_time_stamp(t)
{
var date = new Date(t*1000);
var officialdate = (date.getMonth()+1).toString() + '/' + date.getDate().toString() + '/' + date.getFullYear().toString()
var hours = date.getHours();
var minutes = "0" + date.getMinutes();
var seconds = "0" + date.getSeconds();
var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
var converted_time = (officialdate + ' ' +formattedTime)
return converted_time
}


app.get("/twittermessages", function(req, res){
  // Use connect method to connect to the server
  var twitterClient = new Twitter({
      consumer_key: 'fSF2cv9DMbMcWjCJEkJ3IOn5R',
      consumer_secret: 's9qsB5kITvkO9OhHw1FEXkqSRJeYxH9Oar7mwKClv8k1vD3oLE',
      access_token_key: '618369151-SYSVzJsLeYN10oHIQlYonGpX1CzWW8IIGa55vfn5',
      access_token_secret: '3M3Io513SpndXqOdPT69G8eVpLhZ47TktiukmIKGRqN3a'
  });

  let get_sender_name = function(sender_id){
    return new Promise(function(resolve, reject){
      var url = 'https://api.twitter.com/1.1/users/show.json?user_id=' + String(sender_id)
      twitterClient.get(url, function(error, response, body) {
        var obj = JSON.parse(body.body)
        resolve(obj.screen_name)
      });
    })
  }

  var params = {screen_name: 'nodejs'};
    var twitter_messages = {data:[]}
    twitterClient.get('direct_messages/events/list', params, function(error, tweets, response) {
      var tweetPromises = [];
      tweets["events"].forEach(function(tweet) {
          var platform = "<img src='https://png.icons8.com/cotton/2x/twitter.png' style='height:30px; width:30px'> <div hidden>Twitter</div>";
          var sender_id = tweet["message_create"].sender_id;
          var message = tweet["message_create"]["message_data"]["text"];
          var created_timestamp = convert_unix_time_stamp(parseInt(tweet.created_timestamp.substring(0, 10).toString()));
          console.log(message)
          tweetPromise = get_sender_name(sender_id).then(function(sender_name) {
              twitter_messages.data.push({
                  "platform": platform, 
                  "sender_id": sender_name, 
                  "message": message, 
                  "time_stamp": created_timestamp 
              }); 
          });
          tweetPromises.push(tweetPromise);
      })
      Promise.all(tweetPromises).then(function(sender_names) {
          res.send(twitter_messages);
      })
      
    });



})

app.get("/slackmessages", function(req, res) {


  let get_sender_name = function(sender_id, request_url){
    return new Promise(function(resolve, reject){
      request.get(request_url, function(error, response, body){
        var obj = JSON.parse(body)
        resolve(obj.profile.real_name)
      });
    })
  }


  var messages = {data:[]}
  var slackToken = 'xoxa-309091349812-354349657141-353983251444-c0e6ce86fca71c1219851f6d02626f67'
  var slackClient =  new Slack({
    access_token: slackToken,
    scope: 'read'});
    var channelName = "general";
    slackClient.channels.list({
        token: slackToken
    }).then(function(channelList) {
        var channelId = "";
        for(var i = 0;i < channelList['channels'].length; i++) {
            var channel = channelList['channels'][i];
            if (channel['name'] == channelName) {
                channelId = channel['id'];
                break;
            }
        }

        console.log(channelId);
        // Get history of specified channel messages
        slackClient.channels.history({
            token: slackToken,
            channel: channelId
        }).then(function(history) {
            //console.log(history["messages"]);
            var msgs = history["messages"];
            msgPromises = [];
            //console.log(msgs);
            msgs.forEach(function(msg) {
                var platform = "<img src='http://www.icons101.com/icon_png/size_512/id_73479/Slack.png' style='height:30px; width:30px'> <div hidden>Twitter</div>";
                var sender_id = msg.user
                var message = msg.text
                var created_timestamp = convert_unix_time_stamp(msg.ts);
                var request_url = 'https://slack.com/api/users.profile.get?token=' + slackToken + '&user=' + sender_id;

                var msgPromise = get_sender_name(sender_id, request_url).then(function(sender_name) {
                    messages.data.push({
                        "platform": platform, 
                        "sender_id": sender_name,
                        "message": message, 
                        "time_stamp": created_timestamp
                    })
                });
                
                msgPromises.push(msgPromise);
                })
            Promise.all(msgPromises).then(function(sender_name) {
              console.log(messages.data)
            });
            });
            
            /*
            for(var i = 0; i < msgs.length; i++) {
                var platform = "<img src='http://www.icons101.com/icon_png/size_512/id_73479/Slack.png' style='height:30px; width:30px'> <div hidden>Twitter</div>";
                var sender_id = msgs[i].user
                var message = msgs[i].text
                var created_timestamp = convert_unix_time_stamp(msgs[i].ts);
                console.log(sender_id);
                var msgPromise = slackClient.users.profile.get({
                  token: slackToken, 
                  users: sender_id
                }).then(function(sender_name_data){
                  var sender_name = sender_name_data.profile.real_name;
                  //console.log(sender_name);
                  messages.data.push({
                    "platform": platform, 
                    "sender_id": sender_name, 
                    "message": message, 
                    "time_stamp": created_timestamp
                  })
                });

                msgPromises.push(msgPromise);
            }*/

    });
});


app.get("/app_selection", function(req, res){
  //if global_username in user_preferences ---update
  //if global_username !in user_preferences --insert
  console.log(res)
  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    db.collection("user_preferences").findOne({username: global_username}, function(err, result) {
      if (err) throw err;
      var user_preferences = req.query
        for (var key in user_preferences){
          if(user_preferences.hasOwnProperty(key)){
            if (typeof user_preferences[key] == 'string'){
              user_preferences[key] = [user_preferences[key]]
            }
          } 
        }
        var obj = {"username": global_username, user_preferences}
        assert.equal(null, err);
        const db = client.db(dbName);
      if (result == null){ //username doesnt exist
          insertUserDocuments(db, obj, function() {});
          res.sendFile(__dirname + "/pages/webpage_v1.html")
      }
      else{
          db.collection("user_preferences").replaceOne({"username" : global_username}, obj);
          res.sendFile(__dirname + "/pages/webpage_v1.html")
      }
      
    });
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
