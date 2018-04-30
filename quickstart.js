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



  var messages = {data:[ { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Chirag Aswani',
    message: 'So come thru if you can, I got a lot of shit done yesterday, I just need help linking log ins ',
    time_stamp: '4/29/2018 11:53:59' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Tyrone Hou',
    message: 'And after',
    time_stamp: '4/29/2018 1:05:11' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Chirag Aswani',
    message: 'I am really struggling',
    time_stamp: '4/29/2018 15:03:31' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Chirag Aswani',
    message: 'there is still a lot to do :disappointed:',
    time_stamp: '4/28/2018 17:54:12' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Natalya Shelchkova',
    message: ':((',
    time_stamp: '4/29/2018 15:14:31' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Tyrone Hou',
    message: 'Could you open the door plz',
    time_stamp: '4/29/2018 15:38:52' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Natalya Shelchkova',
    message: 'I wont be back till monday but I can help through this!',
    time_stamp: '4/28/2018 17:32:04' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Jacob Levy',
    message: 'True. I think it’l be worth it though ',
    time_stamp: '4/28/2018 17:49:23' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Chirag Aswani',
    message: 'Ya I said this when we were deciding on projects',
    time_stamp: '4/28/2018 17:48:08' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Chirag Aswani',
    message: 'aite im here',
    time_stamp: '4/29/2018 12:48:20' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Chirag Aswani',
    message: 'wanna meet at like 7 tomorrow?',
    time_stamp: '4/28/2018 17:30:15' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Natalya Shelchkova',
    message: 'hows it going?',
    time_stamp: '4/29/2018 15:01:11' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Chirag Aswani',
    message: 'Its just that there is a lot of extra work to do for an easy A class',
    time_stamp: '4/28/2018 17:48:33' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Chirag Aswani',
    message: 'not good with git, so i cant pull your changes',
    time_stamp: '4/28/2018 14:55:39' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Chirag Aswani',
    message: 'its fine though',
    time_stamp: '4/28/2018 14:56:30' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Jacob Levy',
    message: 'Btw idk if you guys have talked to other groups but I realized that what we’re doing is really ambitious compared to others',
    time_stamp: '4/28/2018 17:42:48' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Jacob Levy',
    message: '<@U936QBWA1> set the channel topic: The dankest group chat in town',
    time_stamp: '4/26/2018 22:00:43' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Tyrone Hou',
    message: 'Also I’ll be there in fifteen minutes, sorry, printing a poster for another project',
    time_stamp: '4/29/2018 15:14:59' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Chirag Aswani',
    message: '<https://api.slack.com/custom-integrations/legacy-tokens>',
    time_stamp: '4/26/2018 19:38:22' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Tyrone Hou',
    message: 'cs lab or build lab?',
    time_stamp: '4/26/2018 21:40:39' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Chirag Aswani',
    message: 'same with newsfeed',
    time_stamp: '4/28/2018 14:54:34' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Chirag Aswani',
    message: '<@U944XFFAB> uploaded a file: <https://cs-411-workspace.slack.com/files/U944XFFAB/FAE64DEN6/todo-cs411.txt|todo-cs411.txt>',
    time_stamp: '4/26/2018 19:08:08' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Tyrone Hou',
    message: 'We’re in innovate',
    time_stamp: '4/26/2018 21:40:44' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Natalya Shelchkova',
    message: 'In what sense?',
    time_stamp: '4/28/2018 14:54:09' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Jacob Levy',
    message: 'I’m here, where are you guys?',
    time_stamp: '4/26/2018 21:39:26' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Chirag Aswani',
    message: '<@U9424QLJJ> are you free tomorrow?',
    time_stamp: '4/28/2018 22:04:30' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Natalya Shelchkova',
    message: 'But we could also meet somewhat separately  ',
    time_stamp: '4/21/2018 18:30:58' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Natalya Shelchkova',
    message: '<https://dev.twitter.com/web/overview/css>',
    time_stamp: '4/28/2018 14:24:27' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Jacob Levy',
    message: 'Still meeting at the lab?',
    time_stamp: '4/26/2018 8:05:38' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Chirag Aswani',
    message: 'for example, on messages, if we dynamically add the messages from the back end, the page will really really long',
    time_stamp: '4/28/2018 14:54:26' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Natalya Shelchkova',
    message: 'Mhm',
    time_stamp: '4/28/2018 14:54:37' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Natalya Shelchkova',
    message: 'I’m fine with that!',
    time_stamp: '4/26/2018 12:02:21' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Natalya Shelchkova',
    message: 'And we can meet earlier and then have Jacob join us later ',
    time_stamp: '4/24/2018 12:38:19' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Chirag Aswani',
    message: 'okay',
    time_stamp: '4/28/2018 14:55:16' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Tyrone Hou',
    message: 'Yeah! Sorry, I was at a poster presentation most of the day. And then I was so tired I took a five hour nap... I have a meeting from 7-8pm, but I\'m free earlier in the day to hammer everything out.',
    time_stamp: '4/29/2018 1:05:09' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Natalya Shelchkova',
    message: 'this is what I used to do the tweets, it has links on how to use javascript to embed messages',
    time_stamp: '4/28/2018 14:24:57' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Chirag Aswani',
    message: 'I prefer the lab since it’s empty and I have 24hr access ',
    time_stamp: '4/26/2018 11:09:25' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Natalya Shelchkova',
    message: 'just let me know what you need/if you have any questions once you get tot it',
    time_stamp: '4/28/2018 14:57:41' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Chirag Aswani',
    message: 'idk',
    time_stamp: '4/28/2018 17:54:01' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Jacob Levy',
    message: 'Not that that’s a problem, just interesting ',
    time_stamp: '4/28/2018 17:42:57' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Chirag Aswani',
    message: 'because i had to fix some front end stuff for the backend',
    time_stamp: '4/28/2018 14:55:47' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Jacob Levy',
    message: 'On my way from West',
    time_stamp: '4/26/2018 21:13:37' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Chirag Aswani',
    message: 'Okay Tuesday at 9? We can meet up at the innovate lab',
    time_stamp: '4/24/2018 12:35:08' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Natalya Shelchkova',
    message: 'So youre getting conflicts?',
    time_stamp: '4/28/2018 14:56:08' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Chirag Aswani',
    message: 'All good, ima hit the innovate lab in an hr',
    time_stamp: '4/29/2018 11:53:23' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Jacob Levy',
    message: 'Where u at',
    time_stamp: '4/19/2018 19:25:07' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Chirag Aswani',
    message: 'Aite We are going to the cs lab rn',
    time_stamp: '4/26/2018 18:05:50' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Tyrone Hou',
    message: 'OK, my event\'s done. Took longer than I thought. omw over now',
    time_stamp: '4/19/2018 18:39:53' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Natalya Shelchkova',
    message: 'So that shouldn’t be a problem right now because things will just scroll ',
    time_stamp: '4/28/2018 14:54:50' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Jacob Levy',
    message: 'I’m free after 8',
    time_stamp: '4/29/2018 1:23:13' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Chirag Aswani',
    message: 'Nah I think front end is set, we need to catch up on the backend ',
    time_stamp: '4/29/2018 15:19:47' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Natalya Shelchkova',
    message: 'Actually short of the css for google calendars everything else is done webpage wise',
    time_stamp: '4/28/2018 14:53:07' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Jacob Levy',
    message: 'On my way from Warren',
    time_stamp: '4/19/2018 16:46:59' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Tyrone Hou',
    message: 'xD',
    time_stamp: '4/26/2018 21:40:53' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Natalya Shelchkova',
    message: 'also I realized that I forgot to add a thing that will allow you to send a message, however I can implement that once I know if thats a thing we can do',
    time_stamp: '4/29/2018 15:16:54' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Jacob Levy',
    message: 'Are you in innovate or the CS lab?',
    time_stamp: '4/26/2018 21:40:39' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Chirag Aswani',
    message: 'yeah',
    time_stamp: '4/28/2018 14:56:22' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Jacob Levy',
    message: 'I’m in the lab',
    time_stamp: '4/26/2018 21:40:30' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Natalya Shelchkova',
    message: 'Sure!',
    time_stamp: '4/18/2018 13:10:02' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Natalya Shelchkova',
    message: 'okie',
    time_stamp: '4/28/2018 14:57:28' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Chirag Aswani',
    message: 'Okay we have to change a lot of the front end though',
    time_stamp: '4/28/2018 14:53:56' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Jacob Levy',
    message: 'Yee',
    time_stamp: '4/18/2018 12:42:59' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Tyrone Hou',
    message: 'are you guys at the cs lab rn',
    time_stamp: '4/26/2018 19:30:10' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Natalya Shelchkova',
    message: 'can I help somehow?',
    time_stamp: '4/29/2018 15:14:36' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Natalya Shelchkova',
    message: 'Newsfeed page is done',
    time_stamp: '4/28/2018 14:22:55' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Natalya Shelchkova',
    message: 'I will have to make the top and side navbars sticky so they can follow the page as it scrolls',
    time_stamp: '4/28/2018 14:55:11' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Jacob Levy',
    message: 'I can meet tomorrow night and Thursday night ',
    time_stamp: '4/24/2018 12:33:59' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Jacob Levy',
    message: 'Oh',
    time_stamp: '4/26/2018 21:40:47' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Chirag Aswani',
    message: 'Sounds goood',
    time_stamp: '4/24/2018 12:39:09' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Natalya Shelchkova',
    message: 'I thought we’d meet at Chirag’s place again? Or we can do Mugar or what not',
    time_stamp: '4/26/2018 10:13:20' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Chirag Aswani',
    message: 'Yeah we can meet separately, that works too',
    time_stamp: '4/23/2018 10:13:35' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Tyrone Hou',
    message: 'Any of those days work for me lol',
    time_stamp: '4/21/2018 20:10:13' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Tyrone Hou',
    message: 'Works for me too!',
    time_stamp: '4/24/2018 15:26:36' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Jacob Levy',
    message: 'I don’t mind working late ',
    time_stamp: '4/24/2018 12:38:04' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Chirag Aswani',
    message: 'Let’s decide on a time, it’s due in a week',
    time_stamp: '4/24/2018 12:33:01' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Natalya Shelchkova',
    message: 'I can do that',
    time_stamp: '4/24/2018 12:38:04' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Jacob Levy',
    message: 'I have something 7-9 on Thursday but can come after',
    time_stamp: '4/21/2018 16:40:10' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Chirag Aswani',
    message: '*thursday',
    time_stamp: '4/24/2018 12:35:17' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Chirag Aswani',
    message: '<https://api.slack.com/methods/channels.history/test>',
    time_stamp: '4/26/2018 19:38:15' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Chirag Aswani',
    message: 'Dope',
    time_stamp: '4/19/2018 16:58:21' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Chirag Aswani',
    message: 'Are y’all free this Thursday after 6:30 to work on the project?',
    time_stamp: '4/21/2018 11:21:39' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Jacob Levy',
    message: 'Hot',
    time_stamp: '4/19/2018 19:37:39' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Tyrone Hou',
    message: 'What number was it?',
    time_stamp: '4/19/2018 19:39:06' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Jacob Levy',
    message: 'Tyrone',
    time_stamp: '4/19/2018 19:25:01' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Chirag Aswani',
    message: 'Sounds good man ',
    time_stamp: '4/19/2018 17:06:59' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Chirag Aswani',
    message: '<https://blackrockdigital.github.io/startbootstrap-sb-admin/index.html>',
    time_stamp: '4/19/2018 17:26:24' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Natalya Shelchkova',
    message: 'I’d prefer if we didn’t do weekends',
    time_stamp: '4/21/2018 18:30:46' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Tyrone Hou',
    message: 'Here',
    time_stamp: '4/19/2018 19:38:52' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Tyrone Hou',
    message: 'I shall come when my event is over.',
    time_stamp: '4/19/2018 16:58:44' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Chirag Aswani',
    message: 'Ah shit I’m busy Tuesday, what about weekend?',
    time_stamp: '4/21/2018 18:01:06' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Natalya Shelchkova',
    message: 'I’m here!',
    time_stamp: '4/19/2018 17:09:07' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Tyrone Hou',
    message: 'Almost here. T_T walking from Harvard Ave. The train was an express',
    time_stamp: '4/19/2018 19:31:29' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Chirag Aswani',
    message: 'Submitted it',
    time_stamp: '4/20/2018 11:25:26' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Chirag Aswani',
    message: 'Aite same place? 328 Saint Paul st #3 ',
    time_stamp: '4/18/2018 12:37:01' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Jacob Levy',
    message: '5 works',
    time_stamp: '4/18/2018 12:07:16' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Tyrone Hou',
    message: 'On st. Paul',
    time_stamp: '4/19/2018 19:37:31' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Natalya Shelchkova',
    message: 'On my way from west',
    time_stamp: '4/19/2018 16:51:55' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Tyrone Hou',
    message: 'I have a meeting till 7 but I\'m free the rest of the night.',
    time_stamp: '4/26/2018 18:07:29' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Jacob Levy',
    message: 'I can be there at 9:30',
    time_stamp: '4/24/2018 12:37:59' },
  { platform: '<img src=\'http://www.icons101.com/icon_png/size_512/id_73479/Slack.png\' style=\'height:30px; width:30px\'> <div hidden>Twitter</div>',
    sender_id: 'Natalya Shelchkova',
    message: 'We can also do Tuesday?',
    time_stamp: '4/21/2018 17:31:36' } ]} 
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
    var code = req.url.split('?')[1].split('&')[0].split('=')[1];
    
    var request_url = 'https://slack.com/api/oauth.access?client_id=309091349812.353983200660&client_secret=ff6009d13d1e97ccafb901e03c9c9fee?&code='+code;
    request.get(request_url, function(error, response, body){
        console.log(body);
        var obj = JSON.parse(body)
        console.log(obj);
      });
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

  let getTwitterMessages = function(){
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
  }



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
