# Socialite
- Project for CS 411 at Boston University - Software Engineering
- Please read the "README.md" in docs

## Description
Socialite is a platform to view your messages, calendar, and newsfeed from popular social media sites into one platform. The goal is to have one area to view everything so there is less clutter in your life.

## Notes
- We were unable to use Facebook Messages and Facebook News Feed API due to Facebook's recent privacy scandal. They were not recieving any requests for new applications
- We were unable to use Google+ Hangouts API as it is no longer supported: https://developers.google.com/+/hangouts/
- Due to these restrictions we ended up using a geolocation for our eventbrite to get event data around the area. This public data gives value to our business proposition as users can see all important information into one page

## Teammates
Chirag Aswani, Jacob Levy, Tyrone Hou, Natalya Shelchkova

## How to Run
### MongoDB
- Hostname: localhost
- Port: 27017
- Collections: authentication, oauth
### Node
node quickstart.js
