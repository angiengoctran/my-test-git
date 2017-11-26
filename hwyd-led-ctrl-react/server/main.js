import { Meteor } from 'meteor/meteor';
import Led from '../imports/api/led.js'
import { connect } from 'mqtt/lib/connect';
import SerialPort from 'serialport';
 
const Readline = SerialPort.parsers.Readline;
const parser = new Readline();
var port = new SerialPort('/dev/cu.usbmodem1421', {
  baudRate: 9600
});
port.pipe(parser);

// parse the data from serial into meaningful objects
function onData(data) {
  console.log(data);
  // send the character over mqtt
  // client.publish("led", text);
}

// our callback function must be wrapped in Meteor.bindEnvironment to avoid Fiber errors
parser.on('data', Meteor.bindEnvironment(onData));

// Open errors will be emitted as an error event
port.on('error', function(err) {
  console.log('Error: ', err.message);
})

function writeSerialData(data) {

  port.write(data, function(err) {
    if (err) {
      return console.log('Error on write: ', err.message);
    }
    console.log('wrote', data);
  });

}


Meteor.methods({
  'serial.write'(pixels) {

    var message = "";
    
    for (var i = 0, len = pixels.length; i < len; i++) {
      var pixelStr = "";
      pixelStr += pixels[i].r + ",";
      pixelStr += pixels[i].g + ",";
      pixelStr += pixels[i].b;

      if (i < pixels.length) {
        pixelStr += "|";
      }
      writeSerialData(pixelStr);

      message += pixelStr;

    }
    writeSerialData('/r');

    console.log(message);

    client.publish("ledgrid", message);
    
  }
})

 

export const config = {
  mqttHost: "mqtt://192.168.250.162",
  mqttPort: 1883
};

export const client = connect(config.mqttHost);

client.on('message', function (topic, message) {
  // message is Buffer
  console.log("received_message", message.toString());

  var splitIntoPixels = message.toString().split("|");

  for (var i = 0; i < splitIntoPixels.length - 1; i++) {
    console.log(splitIntoPixels[i]);
    writeSerialData(splitIntoPixels[i]);
  }
  

  // 

})

client.on("connect", function() {
  console.log("---- mqtt client connected ----");
  client.subscribe("ledgrid");
})

Meteor.startup(() => {
  // code to run on server at startup
});