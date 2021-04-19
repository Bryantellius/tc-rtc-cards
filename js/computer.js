const serverUrl = window.location.host;
let computerId = generateId();
let id = 0;
let standard = 0;
let bronze = 0;
let silver = 0;
let gold = 0;
let royal = 0;
let rare = 0;

// listen for the doms elements to be loaded
document.addEventListener(
  "DOMContentLoaded",
  () => {
    console.log("document onload");
    // connect to the websocket server
    const socket = io.connect(serverUrl, { transports: ["websocket"] });

    // emit a message detailing the computer connection
    socket.emit("computer-connect", computerId);

    // listen for the phone movements
    socket.on("phone-move", phoneMoved);

    // listen for the phone connections
    socket.on("phone-connect", phoneConnected);

    // listen for card throws
    socket.on("phone-throw-card", throwCard);

    // generate qrcode
    const url = `http://${serverUrl}/?id=${computerId}`;
    qrCodeGenerator(url, "placeholder");

    // display the url on the dom
    document.getElementById("url").innerHTML = url;
  },
  false
);

// ===== Service Functions

// DEVICEORIENTATION NOT AVAILABLE OVER HTTP (localhost)
function phoneMoved(angle) {
  // change the angle of the phone direction indicator
  const path = document.querySelector("#phone-move.path");
  path.style = `transform: rotate(${angle}deg)`;
}

function throwCard(card) {
  // adds the throw card to the computer display
  let cardId = `card${id++}`;
  addCard(cardId, card.angle, card.suit, card.rank);
  changeScore(card);
  console.log(card.suit, card.rank);
  console.log(standard, bronze, silver, gold, royal, rare);
  // force the animation with a timeout of 100ms
  setTimeout(() => {
    const cardElement = document.getElementById(cardId);
    cardElement.classList.add("thrown");
    cardElement.style = `transform: translateY(${
      100 - card.strength
    }vh) scale(1)`;
  }, 100);
}

function changeScore(card) {
  if (card.suit !== "joker") {
    if (card.rank <= 15) {
      document.getElementById("standard-count").textContent = ++standard;
    } else if (card.rank <= 22 && card.rank >= 16) {
      document.getElementById("bronze-count").textContent = ++bronze;
    } else if (card.rank <= 26 && card.rank >= 23) {
      document.getElementById("silver-count").textContent = ++silver;
    } else if (card.rank <= 29 && card.rank >= 27) {
      document.getElementById("gold-count").textContent = ++gold;
    } else if (card.rank === 30) {
      document.getElementById("royal-count").textContent = ++royal;
    }
  } else {
    document.getElementById("rare-count").textContent = ++rare;
  }
}

function phoneConnected() {
  // once a phone connects, remove the "waiting for..." element
  document.getElementById("waiting-for-device").remove();
}

function addCard(id, angle, suit, rank) {
  console.log("card angle: ", angle);
  document.body.innerHTML += `<div class="path" style="transform: rotate(${angle}deg)"><div id="${id}" class="card ${suit} rank${rank}"><div class="face"/></div></div>`;
}

function qrCodeGenerator(value, elementId) {
  console.log("Inside qrCodeGenerator");
  const qr = qrcode(4, "L");
  qr.addData(value);
  qr.make();
  document.getElementById(elementId).innerHTML = qr.createImgTag(4, 16);
}

function generateId() {
  // generates a random 5 character id
  let d = new Date().getTime();
  if (window.performance && typeof window.performance.now === "function") {
    d += performance.now();
  }
  const uuid = "xxxxx".replace(/[xy]/g, (c) => {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
  return uuid;
}
