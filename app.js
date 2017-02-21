var onPi = process.arch == 'arm' ? true : false;

var awsIot = require('aws-iot-device-sdk');
if (onPi) var Gpio = require('onoff').Gpio;

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

if (onPi) {
  console.log("Running on Raspberry Pi");
  var rled = new Gpio(16, 'out'),
      yled = new Gpio(20, 'out'),
      gled = new Gpio(21, 'out');
}

// Client token value returned from thingShadows.update() operation
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
// Thing Shadow named 'TrafficLight'.
//
  thingShadows.register( 'TrafficLight', {}, function() {

// Once registration is complete, get the Thing Shadow named
// 'TrafficLight' latest device state and save the clientToken
// so that we can correlate it with status or timeout events.
//

  clientTokenGet = thingShadows.get('TrafficLight');
//
// The update method returns a clientToken; if non-null, this value will
// be sent in a 'status' event when the operation completes, allowing you
// to know whether or not the update was successful.  If the update method
// returns null, it's because another operation is currently in progress and
// you'll need to wait until it completes (or times out) before updating the
// shadow.
//
    if (clientTokenGet === null)
     {
        console.log('update shadow failed, operation still in progress');
     } else {
       console.log("Get result ", JSON.stringify(clientTokenGet));
     }
  });

thingShadows.on('status',
    function(thingName, stat, clientToken, stateObject) {
     console.log('received '+stat+' on '+thingName+': '+ JSON.stringify(stateObject));

     if (stat == "accepted" && thingName == "TrafficLight") {
       var lastState = stateObject.state.desired;
       rval = lastState.red;
       yval = lastState.yellow;
       gval = lastState.green;
       setLight();
     }
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
      if(thingName == "TrafficLight"){
         var states = stateObject.state;
         rval = states.red;
         yval = states.yellow;
         gval = states.green;
         setLight();
       }
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

var setLight = function() {
  console.log("setting r = " + rval + ", y = " + yval + ", g = " + gval);
  if (onPi) {
    // onoff prefers binary
    rled.writeSync(Number(rval));
    yled.writeSync(Number(yval));
    gled.writeSync(Number(gval));
  }
};

var getLight = function() {
  if (onPi) {
    rval = Boolean(rled.readSync());
    yval = Boolean(yled.readSync());
    gval = Boolean(gled.readSync());
  } else  {
    console.log("getLight not supported");
  }
};

// cleanup
process.on('SIGINT', function () {
  console.log("shutting down");
  if (onPi) {
    rled.unexport();
    yled.unexport();
    gled.unexport();
  }
  process.exit();
});
