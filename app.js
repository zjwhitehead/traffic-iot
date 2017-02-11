var awsIot = require('aws-iot-device-sdk');
//var Gpio = require('onoff').Gpio;

//
// Replace the values of '<YourUniqueClientIdentifier>' and '<YourAWSRegion>'
// with a unique client identifier and the AWS region you created your
// certificate in (e.g. 'us-east-1').  NOTE: client identifiers must be
// unique within your AWS account; if a client attempts to connect with a
// client identifier which is already in use, the existing connection will
// be terminated.
//
var thingShadows = awsIot.thingShadow({
   keyPath: 'TrafficLight.private.key',
  certPath: 'TrafficLight.cert.pem',
    caPath: 'root-CA.crt',
  clientId: '711079405428',
    region: 'us-east-1'
});


//var rled = new Gpio(13, 'out'),
//    yled = new Gpio(19, 'out'),
//    gled = new Gpio(26, 'out');

//
// Client token value returned from thingShadows.update() operation
//
var clientTokenUpdate;

//
// Set red to on by default
//
var rval = true, 
    yval = false, 
    gval = false;


thingShadows.on('connect', function() {
//
// After connecting to the AWS IoT platform, register interest in the
// Thing Shadow named 'RGBLedLamp'.
//
  thingShadows.register( 'TrafficLight', {}, function() {

// Once registration is complete, update the Thing Shadow named
// 'TrafficLight' with the latest device state and save the clientToken
// so that we can correlate it with status or timeout events.
//
// Thing shadow state
//
  var trafficLightState = {"state":{"desired":{"red":rval, "yellow":yval, "green":gval}}};
  clientTokenUpdate = thingShadows.update('TrafficLight', trafficLightState  );
//
// The update method returns a clientToken; if non-null, this value will
// be sent in a 'status' event when the operation completes, allowing you
// to know whether or not the update was successful.  If the update method
// returns null, it's because another operation is currently in progress and
// you'll need to wait until it completes (or times out) before updating the 
// shadow.
//
    if (clientTokenUpdate === null)
     {
        console.log('update shadow failed, operation still in progress');
     }
  });

thingShadows.on('status', 
    function(thingName, stat, clientToken, stateObject) {
      // console.log('received '+stat+' on '+thingName+': '+ JSON.stringify(stateObject));
//
// These events report the status of update(), get(), and delete() 
// calls.  The clientToken value associated with the event will have
// the same value which was returned in an earlier call to get(),
// update(), or delete().  Use status events to keep track of the
// status of shadow operations.
//
    });

thingShadows.on('delta', 
    function(thingName, stateObject) {
      // console.log('received delta on '+thingName+': '+  JSON.stringify(stateObject));
       var states = stateObject.state;
       changeLight(states.red, states.yellow, states.green);
    });

thingShadows.on('timeout',
    function(thingName, clientToken) {
       console.log('received timeout on '+thingName+
                   ' with token: '+ clientToken);

//
// In the event that a shadow operation times out, you'll receive
// one of these events.  The clientToken value associated with the
// event will have the same value which was returned in an earlier
// call to get(), update(), or delete().
//
    });


});

var changeLight = function(rstate, ystate, gstate ) {
  console.log("red =", rstate);
  console.log("yellow =", ystate);
  console.log("green =", gstate);
  //rled.writeSync(rstate);
  //yled.writeSync(ystate);
  //gled.writeSync(gstate);

  
};

// cleanup
process.on('SIGINT', function () {
  //rled.unexport();
  //yled.unexport();
  //gled.unexport();
  console.log("shutting down");
  process.exit();
});