const serverUrl = window.location.host;
const tableId = generateId();
let id = 0;

// listen for the doms elements to be loaded
document.addEventListener(
  "load",
  () => {
    // connect to the websocket server
    const socket = io.connect(serverUrl);

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

function phoneMoved(angle) {
  // change the angle of the phone direction indicator
  const path = document.querySelector("#phone-move.path");
  path.style = `transform: rotate(${angle}deg)`;
}

function throwCard(card) {
  // adds the throw card to the computer display
  let cardId = `card${id++}`;
  addCard(cardId, card.angle, card.suit, card.rank);

  // force the animation with a timeout of 100ms
  setTimeout(() => {
    const cardElement = document.getElementById(cardId);
    cardElement.classList.add("thrown");
    cardElement.style = `transform: translateY(${
      100 - card.strength
    }vh) scale(1)`;
  }, 100);
}

function phoneConnected() {
  // once a phone connects, remove the "waiting for..." element
  document.getElementById("waiting-for-device").remove();
}

function addCard(id, angle, suit, rank) {
  document.body.innerHTML += `<div class="path" style="transform: rotate(${angle}deg)"><div id="${id}" class="card ${suit} rank${rank}"><div class="face"/></div></div>`;
}

function qrCodeGenerator(value, elementId) {
  const qr = qrcode(4, "L");
  qr.addData(value);
  qr.make();
  document.getElementById(elementId).innerHTML = qr.createImgTag(4, 16);
}

function generateId() {
  // generates a random 5 character id
  const d = new Date().getTime();
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
