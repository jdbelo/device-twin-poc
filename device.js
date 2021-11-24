const Client = require("azure-iot-device").Client;
const Protocol = require("azure-iot-device-mqtt").Mqtt;
const net = require("net");

require("dotenv").config();
var prompt = require("prompt-sync")();

let connectionString = process.env.CONNECTION_STRING;

while (!connectionString) {
  // if .env file does not contain a CONNECTION_STRING, promts user to insert one
  connectionString = prompt("Connection string: ");
}

const client = Client.fromConnectionString(connectionString, Protocol);

let deviceTwin = null;

client.getTwin(function (err, twin) {
  if (err) {
    console.error("could not get twin");
    deviceTwin = null;
  } else {
    console.log("twin created");
    deviceTwin = twin;

    twin.on("properties.desired.config", function (config) {
      console.log(`remote: new configs received: ${JSON.stringify(config)}`);

      config = {
        config,
      };

      // report properties are updated with the new configuration
      twin.properties.reported.update(config, function (err) {
        if (err) {
          throw err;
        }
        console.log(`twin state reported: ${JSON.stringify(config)}`);
      });
    });
  }
});

const server = net
  .createServer((socket) => {
    socket.on("data", (config) => {
      config = JSON.parse(config);
      console.log(`local: new configs received: ${JSON.stringify(config)}`);
      socket.write("ok");

      if (!deviceTwin) {
        console.error("could not get twin. twin is not available.");
        return;
      }

      config = {
        config,
      };

      // report properties are updated with the new configuration
      deviceTwin.properties.reported.update(config, function (err) {
        if (err) {
          throw err;
        }
        console.log(`twin state reported: ${JSON.stringify(config)}`);
      });
    });
  })
  .on("error", (err) => {
    console.error(err);
  });

server.listen(8081, () => {
  console.log("opened server on", server.address().port);
});
