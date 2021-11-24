const net = require("net");

const client = new net.Socket();
client.connect(8081, "127.0.0.1", function () {
  console.log("Connected");

  const config = {
    minTemperature: -1, // to redefine minTemperature change here
  };

  client.write(JSON.stringify(config));
});

client.on("data", function (data) {
  console.log(`Received: ${data}`);
  client.destroy(); // kill client after server's response
});

client.on("close", function () {
  console.log("Connection closed");
});
