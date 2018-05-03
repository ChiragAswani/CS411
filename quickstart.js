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
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var passport = require('passport');
var Strategy = require('passport-twitter').Strategy;
var session = require('express-session');
var request = require('request')
var oauthTokens = JSON.parse(fs.readFileSync('oauthTokens.json', 'utf8'))


//App Connections
var app = express();
app.use(cookieParser());
app.use(session({secret: 'whatever', resave: true, saveUninitialized: true}))
app.use(passport.initialize())
app.use(passport.session())

//Mongo Connections
var url = 'mongodb://localhost:27017';
var dbName = 'socialite';

//Global Variables
var global_username = '';
 
//Sets default homepage to welcome_v1.html
app.get("/", function(req, res){
  res.sendFile(__dirname + "/pages/welcome_v1.html")
});

//Goes to messages_v1.html
app.get("/messages_v1.html", function(req, res){
  global_username = req.cookies.username
  res.sendFile(__dirname + "/pages/messages_v1.html")
});

//Goes to newsfeed_v1.html
app.get("/newsfeed_v1.html", function(req, res){
  global_username = req.cookies.username
  getTwitterAuth(global_username).then(function(twitterauth){
    getTwitterFeed(twitterauth).then(function(twitterNewsFeedData){
      parseTwitterNewsFeedData(twitterNewsFeedData).then(function(parsedTwitterFeed){
        res.render(__dirname + "/pages/newsfeed_v1.pug", {twitterFeed: parsedTwitterFeed.data})
      })
    })
  })
});

//Goes to calendar_v1.html
app.get("/calendar_v1.html", function(req, res){
  global_username = req.cookies.username
  var latitude = req.cookies.latitude
  var longitude = req.cookies.longitude
  if (latitude == undefined || longitude == undefined){
    var eventBriteData = [ { name: 'Failed to Get Your Geolocation',
    start_date: 'Please Logout And Allow Location',
    end_date: 'https://support.google.com/chrome/answer/142065?hl=en' }]
    res.render(__dirname + "/pages/calendar_v1.pug", {eventBriteData: eventBriteData})
  }
  else{
    getEventBrite(latitude, longitude).then(function(eventBriteData){
      console.log(eventBriteData)
      res.render(__dirname + "/pages/calendar_v1.pug", {eventBriteData: eventBriteData})
    })
  }
});

//Goes to webpage_v1.html
app.get("/webpage_v1.html", function(req, res){
  global_username = req.cookies.username
    res.sendFile(__dirname + "/pages/webpage_v1.html") 
});

//Goes to app_selection_v1.html
app.get("/app_selection_v1.html", function(req, res){
  res.sendFile(__dirname + "/pages/app_selection_v1.html")
});

//Goes to signup_v1.html
app.get("/signup", function(req, res){
  res.sendFile(__dirname + "/pages/signup_v1.html")
});

//Hosts middle.js on localhost:8000/middle.js
//Why? Our solution for CORS
app.get("/middle.js", function(req, res){
  res.sendFile(__dirname + "/middle.js")
});

//When a userclick "Logout" -> welcome_v1.html
app.get("/goToWelcomePage", function(req, res){
  res.clearCookie("username");
  res.clearCookie("password");
  res.sendFile(__dirname + '/pages/welcome_v1.html')
});

//Goes to app_selection_v1.html
app.get("/goToAppSelection", function(req, res){
    res.sendFile(__dirname + "/pages/app_selection_v1.html")
});

app.get("/search", function(req, res){
	global_username = req.cookies.username
	var searchquery = (req.query.topic)
	getTwitterAuth(global_username).then(function(twitterauth){
		getTwitterSearch(twitterauth, searchquery).then(function(twitterSearchData){
			parseTwitterSearchData(twitterSearchData).then(function(parsedTwitterSearchData){
        		res.render(__dirname + "/pages/newsfeed_v1.pug", {twitterFeed: parsedTwitterSearchData.data})
      		})

		})
	})
});

//Looks up cookie (username='',password='') in mongodb
//Valid Cookie: update cookie, go to webpage_v1.html
//Invalid Cookie: go to login_v1.html
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
        global_username = req.cookies.username
        console.log("Sucessfully logged in with cookies");
        res.sendFile(__dirname + "/pages/webpage_v1.html")
      }  
    });
  }); 
})

//Inserts a temporary "" Auth Documents
//^ Easy for us to update after
//signup_v1.html -> userinput.html
app.get("/createaccount", function(req, res){
  global_username = req.query.username;
  console.log(global_username)
  req.query = {'username': req.query.username, 'password':req.query.password}
  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    insertAuthDocuments(db, req.query, function() {global_username});
    insertFakeOAuthData(db, function() {global_username});
    res.clearCookie("username");
    res.clearCookie("password");
    res.cookie("username", req.query.username);
    res.cookie("password", req.query.password);
    res.sendFile(__dirname + "/pages/app_selection_v1.html")
  });
})

//Assumes that the username and password couldn't be read from the cookies
//Username and password exists: webpage_v1.html
//Username and password !exists: login_v1.html 
//login_v1.html -> webpage_v1.html
app.get("/submit", function(req, res){
  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    db.collection("authentication").findOne({username: req.query.username, password: req.query.password}, function(err, result) {
		if (err) throw err;
	    res.clearCookie("username");
	    res.clearCookie("password");
	    res.cookie("username", req.query.username);
	    res.cookie("password", req.query.password);
	    global_username = req.query.username
	    res.sendFile(__dirname + "/pages/webpage_v1.html")
    });
  });
})

//Returns all of the accounts in the db on localhost:8000/accounts
//Why? To have a javascript alert on the front end 
app.get("/accounts", function(req, res){
	accounts = []
  getAccounts(accounts).then(function(showedAccounts){
  	res.send(showedAccounts)
  })

})

//Returns all of the messages in the db on localhost:8000/messages
//Why? To use DataTables on the front end
app.get("/messages", function(req, res){
    
    if (req.query.q != undefined){
      slackchannel = req.query.q
      if (slackchannel.includes('#')){
        slackchannel = slackchannel.substring(1,slackchannel.length-1)
        
      }
      
    var slackToken, twitterToken, twitterSecret;
    let getSlackOAuthData = new Promise(function(resolve, reject) {
        MongoClient.connect(url, function(err, client) {
            const db = client.db(dbName);
            db.collection("oauth").findOne({username: global_username}, function(err, result) {
                current_data = result;
                twitterToken = current_data.twitter.twittertoken;
                twitterSecret = current_data.twitter.twittersecret;
                slackToken = current_data.slacktoken;
                resolve(true);
            });
        });
    });
    getSlackOAuthData.then(function(done) {
        var my_messages = {data:[]}
        slackMessages = getSlackMessages(slackToken, slackchannel);
        twitterMessages = getTwitterMessages(twitterToken, twitterSecret);
        Promise.all([slackMessages, twitterMessages]).then(function(clients) {
            clients.forEach(function(client_messages) {
                my_messages.data = my_messages.data.concat(client_messages.data);
            });
            my_messages = JSON.stringify(my_messages)
            //res.sendFile(__dirname + "/pages/webpage_v1.html")
            res.send(my_messages)
        }).catch(function() {
            console.log('Catch slack data')
            error_message =  {
                "data": [{
                    "platform":"Error:",
                    "sender_id":"Incorrect Slack Channel!",
                    "message":"Please Try Another",
                    "time_stamp":""}]
            }
            error_message = JSON.stringify(error_message)
            res.send(error_message)
        });
    })
}
})

//Using passport to Authorize Twitter
//Is called when user clicks "Authorize All"
app.get('/authorizeTwitter', passport.authenticate('twitter'))

//Twitter CallBack
//Sends to Slack Authentication
app.get('/authorizeTwitterReturn', 
    passport.authenticate('twitter', {failureRedirect: '/'}), function(req, res) {
        var client_id = oauthTokens.slack.client_id
        res.redirect('https://slack.com/oauth/authorize?client_id=' + client_id + '&scope=commands,channels:history,channels:read,channels:write,chat:write,users.profile:read,users.profile:write,users:read,users:read.email,users:write')
});

//Slack CallBack
//Sends to webpage_v1.html
app.get('/authorizeSlackReturn', function(req, res){ 
  get_slack_access_token(req).then(function(access_token){
	storeSlackOAuth(global_username, access_token)
	res.sendFile(__dirname + "/pages/webpage_v1.html")
  })    
})


//Twitter Authentication
passport.use(new Strategy({
    consumerKey: oauthTokens.twitter.consumerKey,
    consumerSecret: oauthTokens.twitter.consumerSecret,
    callbackURL: 'http://localhost:8000/authorizeTwitterReturn'
}, function(token, tokenSecret, profile, callback) {
    MongoClient.connect(url, function(err, client) {
      const db = client.db(dbName);
      db.collection("oauth").findOne({username: global_username}, function(err, result) {
        current_data = result
        current_data.twitter.twittertoken = token
        current_data.twitter.twittersecret = tokenSecret
        db.collection("oauth").replaceOne({"username" : global_username}, current_data);
      });
     })
    return callback(null, profile);
}))
passport.serializeUser(function(user, callback) {
    callback(null, user);
})
passport.deserializeUser(function(obj, callback) {
    callback(null, obj);
})

//Functions

let getAccounts = function(accounts){
  	return new Promise(function(resolve, reject){
  		MongoClient.connect(url, function(err, client) {
    const db = client.db(dbName);
    db.collection("authentication").find({}, function(err, result){
      var cursor = result
      cursor.forEach(function(account){
        accounts.push(account)
      }, function(){
      	resolve(accounts)
      })
      
      
    })
  })
  	})
}

let storeSlackOAuth = function(global_username, access_token){
 MongoClient.connect(url, function(err, client) {
  const db = client.db(dbName);
  db.collection("oauth").findOne({username: global_username}, function(err, result) {
    current_data = result
    current_data.slacktoken = access_token
    db.collection("oauth").replaceOne({"username" : global_username}, current_data);

  });
 })
}

let get_slack_access_token = function(req){
  return new Promise(function(resolve, reject){
    var code = req.url.split('?')[1].split('&')[0].split('=')[1];
      var client_id = oauthTokens.slack.client_id
      var client_secret = oauthTokens.slack.client_secret
      var request_url = 'https://slack.com/api/oauth.access?client_id=' + client_id + '&client_secret=' + client_secret + '&code='+code;
      request.get(request_url, function(error, response, body){
        var obj = JSON.parse(body)
        slack_access_token = obj.access_token
        resolve(slack_access_token)
      });
  })
}

let convert_unix_time_stamp = function(t){
	var date = new Date(t*1000);
	var officialdate = (date.getMonth()+1).toString() + '/' + date.getDate().toString() + '/' + date.getFullYear().toString()
	var hours = date.getHours();
	var minutes = "0" + date.getMinutes();
	var seconds = "0" + date.getSeconds();
	var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
	var converted_time = (officialdate + ' ' +formattedTime)
	return converted_time
}

let getTwitterMessages = function(twitterToken, twitterSecret) {
    let get_sender_name = function(sender_id){
        return new Promise(function(resolve, reject){
            var url = 'https://api.twitter.com/1.1/users/show.json?user_id=' + String(sender_id)
            twitterClient.get(url, function(error, response, body) {
                var obj = JSON.parse(body.body)
                resolve(obj.screen_name)
            });
        })
    }

    var twitterClient = new Twitter({
        consumer_key: oauthTokens.twitter.consumerKey,
        consumer_secret: oauthTokens.twitter.consumerSecret,
        access_token_key: twitterToken,
        access_token_secret: twitterSecret
    });

    var params = {screen_name: 'nodejs'};
    var twitter_messages = {data:[]}
    return new Promise(function(resolve, reject) {
        twitterClient.get('direct_messages/events/list', params, function(error, tweets, response) {
            var tweetPromises = [];
            tweets["events"].forEach(function(tweet) {
                var platform = "<img src='https://png.icons8.com/cotton/2x/twitter.png' style='height:30px; width:30px'> <div hidden>twitter</div>";
                var sender_id = tweet["message_create"].sender_id;
                var message = tweet["message_create"]["message_data"]["text"];
                var created_timestamp = convert_unix_time_stamp(parseInt(tweet.created_timestamp.substring(0, 10).toString()));
                tweetPromise = get_sender_name(sender_id).then(function(sender_name) {
                    twitter_messages.data.push({
                        "platform": platform, 
                        "sender_id": sender_name, 
                        "message": message, 
                        "time_stamp": created_timestamp 
                    }); 
                });
                tweetPromises.push(tweetPromise);
            });

            Promise.all(tweetPromises).then(function(sender_names) {
                resolve(twitter_messages);
            });
        })
    });
}

let getSlackSenderName = function(sender_id, request_url){
    return new Promise(function(resolve, reject){
      request.get(request_url, function(error, response, body){
      var obj = JSON.parse(body)
      resolve(obj.profile.real_name)
      });
    })
}

let getSlackMessages = function(slackToken, channelName) {
  var slack_messages = {data:[]}
  var slackClient =  new Slack({
    access_token: slackToken,
    scope: 'read'});
    return new Promise(function(resolve, reject) {
        slackClient.channels.list({
            token: slackToken
        }).then(function(channelList) {
            var channelId;
            for(var i = 0;i < channelList['channels'].length; i++) {
                var channel = channelList['channels'][i];
                if (channel['name'] == channelName) {
                    channelId = channel['id'];
                    break;

                }
            }
            if (channelId == undefined){
              reject(false)
              return
            }
            slackClient.channels.history({
                token: slackToken,
                channel: channelId
            }).then(function(history) {
                var msgs = history["messages"];
                msgPromises = [];
                var counter = 0
                msgs.forEach(function(msg) {
                	if (counter < 2){
                    var platform = "<img src='http://www.icons101.com/icon_png/size_512/id_73479/Slack.png' style='height:30px; width:30px'> <div hidden>Slack</div>";
                    var sender_id = msg.user
                    var message = msg.text
                    var created_timestamp = convert_unix_time_stamp(msg.ts);
                    var request_url = 'http://slack.com/api/users.profile.get?token=' + slackToken + '&user=' + sender_id;

                    var msgPromise = getSlackSenderName(sender_id, request_url).then(function(sender_name) {
                        slack_messages.data.push({
                            "platform": platform, 
                            "sender_id": sender_name,
                            "message": message, 
                            "time_stamp": created_timestamp
                        })
                    });
                    msgPromises.push(msgPromise);
                    counter += 1
                	}
                	setTimeout(functionTimer, 1000);
                	counter = 0
                })

                Promise.all(msgPromises).then(function(sender_name) {
                    resolve(slack_messages);
                });
            });
        });
    });
}

let functionTimer = function() {
}

let getTwitterAuth = function(global_username){
  return new Promise(function(resolve, reject){
    MongoClient.connect(url, function(err, client) {
      const db = client.db(dbName);
      db.collection("oauth").findOne({username: global_username}, function(err, result) {
        resolve(result.twitter)
      });
    })
  })
}

let getTwitterFeed = function(twitterauth){
	var twitterClient = new Twitter({
	    consumer_key: 'fSF2cv9DMbMcWjCJEkJ3IOn5R',
	    consumer_secret: 's9qsB5kITvkO9OhHw1FEXkqSRJeYxH9Oar7mwKClv8k1vD3oLE',
	    access_token_key: twitterauth.twittertoken,
	    access_token_secret: twitterauth.twittersecret
	});
	return new Promise(function(resolve, reject){
	  twitterClient.get('https://api.twitter.com/1.1/statuses/home_timeline.json', function(error, response, body) {
	    var obj = JSON.parse(body.body)
	    resolve(obj)
	  });
	})
}

let getTwitterSearch = function(twitterauth, searchQuery){
	var twitterClient = new Twitter({
	    consumer_key: 'fSF2cv9DMbMcWjCJEkJ3IOn5R',
	    consumer_secret: 's9qsB5kITvkO9OhHw1FEXkqSRJeYxH9Oar7mwKClv8k1vD3oLE',
	    access_token_key: twitterauth.twittertoken,
	    access_token_secret: twitterauth.twittersecret
	});
	return new Promise(function(resolve, reject){
	  var url = 'https://api.twitter.com/1.1/search/tweets.json?q=' + searchQuery
	  twitterClient.get(url, function(error, response, body) {
	    var obj = JSON.parse(body.body)
	    resolve(obj)
	  });
	})
}

let parseTwitterNewsFeedData = function(twitterNewsFeedData){
	var parsedData = {data:[]}
	return new Promise(function(resolve, reject){
	  for (data in twitterNewsFeedData){
	    parsedData.data.push({
	      "profile_image": twitterNewsFeedData[data].user.profile_image_url,
	      "screen_name": twitterNewsFeedData[data].user.screen_name,
	      "description": (twitterNewsFeedData[data].text.split('https')[0]),
	      "retweet_count": twitterNewsFeedData[data].retweet_count,
	      "favorite_count": twitterNewsFeedData[data].favorite_count,
	      "time_created": twitterNewsFeedData[data].created_at,
	    })
	  }
	  resolve(parsedData)
	})
} 
let parseTwitterSearchData = function(twitterSearchData){
	var parsedData = {data:[]}
	return new Promise(function(resolve, reject){
	  for (data in twitterSearchData.statuses){
	    parsedData.data.push({ 
	      "screen_name": twitterSearchData.statuses[data].user.screen_name,
	      "description": twitterSearchData.statuses[data].text,
	      "retweet_count": twitterSearchData.statuses[data].retweet_count,
	      "time_created": twitterSearchData.statuses[data].created_at,
	    })
	  }
	  resolve(parsedData)
	})
}
let insertAuthDocuments = function(db, data, callback) {
  const collection = db.collection('authentication');
  collection.insertMany([data], function(err, result) {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    assert.equal(1, result.ops.length);
    console.log("Inserted" + data + "Into" + "Mongo collection: authentication");
    callback(result);
  });
}

let insertFakeOAuthData = function(db, callback) {
  const collection = db.collection('oauth');
  data = {'username': global_username, 'slacktoken':'',  'twitter': {'twittertoken': '', 'twittersecret': ''},  'googletoken':''}
  collection.insertMany([data], function(err, result) {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    assert.equal(1, result.ops.length);
    callback(result);
  });
}

let getEventBrite = function(latitude, longitude) {
    return new Promise(function(resolve, reject) {
        var request_url = 'https://www.eventbriteapi.com/v3/events/search/?sort_by=best&token=' + oauthTokens.eventbrite.anonymous_oauth_token + '&location.latitude=' + latitude + '&location.longitude=' + longitude;
        var events = [];
        request.get(request_url, function(error, response, body){
            var obj = JSON.parse(body);
            var raw_events = obj["events"]; 
            raw_events.forEach(function(raw_event) {
                events.push({
                    "name": raw_event.name.text,
                    "start_date": raw_event.start.utc,
                    "end_date": raw_event.end.utc
                });
            })
            resolve(events);
        })
    })
}

app.listen(8000);
console.log('Listening on 8000')
