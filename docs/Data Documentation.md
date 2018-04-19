# Data Documentation 

For our project we are using the non-relational database MongoDB. As of now, we store our data in two separate collections, "authentication" and "user_preferences"

------------------------------

The "authentication" collection stores the username and password of the user as a JSON object. 

An example of the schema is as follows:

* _id: 5ad90b891fedec5be50e6168

    username: "JohnnyBGoode"

    password: "PerryDRocks"

username is stored as a String

password is stored as a String

-----------------------------

The "user_preferences" collection stores the username and associates it with the selected services that the user 
wishes to have in his/her app. These preferences are stored as a JSON object. 
An example of the schema is as follows:

* _id: 5ad0115ae31dd8241fb1fc32

    username: "JohnnyBGoode"

    user_preferences:Object

      slack: Array
      
        0:"slack_messages"
        
        1:"slack_calendar"
        
      google: Array  
      
        0:"google_calendar"
        
      twitter:Array
      
        0:"twitter_messages"
    
username is stored as a String.

user_preferences are stored as an Object

------------------------------

Each social media service is stored as an Array that stores the specific aspects of each platform that the user wants in their
personalized Socialite experience. Inside the Array, each aspect of the social media platform has a unique identifier that is
stored as a String. Each unique identifer will correspond to a specific API call that will call the respective data. 
All fields are required. The keys include the username, the user_preferences, and the names of the social media platforms 
we are using. 

We will using our MongoDB database as a cache to store authentication data so that the user does not have to log in every time
they visit the web site. This data will be stored as a cookie. 