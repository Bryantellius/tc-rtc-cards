const http = require("http");
const fs = require("fs");
const path = require("path");
const open = require("open");
const os = require("os");

const server = http.createServer((req, res) => {
  let filePath = `.${req.url}`;

  if (req.url === "/" || req.url.startsWith("/?")) {
    filePath = `./${req.url.startsWith("/?") ? "phone.html" : "computer.html"}`;
  }

  const extname = path.extname(filePath);
  let contentType = "text/html";

  switch (extname) {
    case ".js":
      contentType = "text/javascript";
      break;
    case ".css":
      contentType = "text/css";
      break;
    case ".png":
      contentType = "image/png";
      break;
    case ".svg":
      contentType = "image/svg+xml";
      break;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.log(
        "Resource not found: " + filePath + " from request: " + req.url
      );
      res.writeHead(404);
      res.end();
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data, "utf-8");
    }
  });
});

server.listen(3000, () => console.log(`Server listening on port 3000`));

const { Server } = require("socket.io");

const realTimeListener = new Server(server);

// Stores computer interface connections
const computerSockets = {};

realTimeListener.on("connection", (socket) => {
  // listens for a connection from a computer
  socket.on("computer-connect", (computerId) => {
    computerSockets[computerId] = socket;
    socket.computerId = computerId;
    console.log("computer-connect", computerId);
  });

  // listens for a connection from a phone/mobile device
  socket.on("phone-connect", (computerId) => {
    const computerSocket = computerSockets[computerId];
    if (computerSocket) {
      // emits a message that a phone connected
      console.log("phone-connect", computerId);
      computerSocket.emit("phone-connect");
    }
  });

  // listens for phone/device movements
  socket.on("phone-move", (data) => {
    const computerSocket = computerSockets[data.computerId];
    if (computerSocket) {
      // emits a message detailing the phone's current angle
      computerSocket.emit("phone-move", data.angle);
    }
  });

  // listens for a throw card event
  socket.on("phone-throw-card", (data) => {
    const computerSocket = computerSockets[data.computerId];
    if (computerSocket) {
      // emits a message detailing the card data to the computer
      computerSocket.emit("phone-throw-card", data);
    }
  });

  // listens for disconnected devices
  socket.on("disconnect", () => {
    // checks if the disconnected device is computer or mobile
    if (socket.computerId) {
      // removes computer socket
      delete computerSockets[socket[computerId]];
    }
  });
});

// Access internal IP addresses for demo
const interfaces = os.networkInterfaces();
const addresses = [];
for (let k in interfaces) {
  for (let k2 in interfaces[k]) {
    let address = interfaces[k][k2];
    if (address.family === "IPv4" && !address.internal) {
      addresses.push(address.address);
      console.log(`Found internal IP address: ${address.address}`);
    }
  }
}

const opening = `http://${addresses.sort()[0]}:3000`;

console.log(`Opening at: ${opening}`);

// open(opening);
