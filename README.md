# Traffic-IOT
**Control a 3 LED traffic light**

Uses [AWS IOT SDK](https://aws.amazon.com/iot/)

#### Setup
`$ npm install`
Optional: `$ npm install forever -g` (may require sudo)

Place certificate and key in project directory and rename to _TrafficLight.private.key_ and _TrafficLight.cert.pem_ 
Replace _clientId_ with thing ID from AWS IOT console.

### Running
`$ node app.js`
To run continuously in the background: `$ forever start app.js`
Stop the forever process: `$ forever stop app.js`

The app expects a boolean value for green, yellow, and red.
For example, to set the desired state using the AWS IOT thing rest API
```
{
   "state":{
      "desired":{
         "red":true,
         "yellow":false,
         "green":false
      }
   }
}
```
Note: each LED can be toggled independently
