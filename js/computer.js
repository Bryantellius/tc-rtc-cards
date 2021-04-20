const serverUrl = window.location.host;
let computerId = generateId();
let id = 0;
let standard = /*localStorage.getItem("standard") || */ 0;
let bronze = /*localStorage.getItem("bronze") || */ 0;
let silver = /*localStorage.getItem("silver") || */ 0;
let gold = /*localStorage.getItem("gold") || */ 0;
let royal = /*localStorage.getItem("royal") || */ 0;
let rare = /*localStorage.getItem("rare") || */ 0;
let ultrarare = /*localStorage.getItem("ultrarare") || */ 0;
const collection = /*localStorage.getItem("collection") ||*/ {
  Ben: {
    standard: false,
    bronze: false,
    silver: false,
    gold: false,
    royal: false,
  },
  John: {
    standard: false,
    bronze: false,
    silver: false,
    gold: false,
    royal: false,
  },
  Cruz: {
    standard: false,
    bronze: false,
    silver: false,
    gold: false,
    royal: false,
  },
  Tanner: {
    standard: false,
    bronze: false,
    silver: false,
    gold: false,
    royal: false,
  },
  Denise: {
    standard: false,
    bronze: false,
    silver: false,
    gold: false,
    royal: false,
  },
  Hampton: {
    standard: false,
    bronze: false,
    silver: false,
    gold: false,
    royal: false,
  },
  Whit: {
    standard: false,
    bronze: false,
    silver: false,
    gold: false,
    royal: false,
  },
  Michael: {
    standard: false,
    bronze: false,
    silver: false,
    gold: false,
    royal: false,
  },
  Jeremy: {
    standard: false,
    bronze: false,
    silver: false,
    gold: false,
    royal: false,
  },
  Mike: {
    standard: false,
    bronze: false,
    silver: false,
    gold: false,
    royal: false,
  },
  Martin: {
    standard: false,
    bronze: false,
    silver: false,
    gold: false,
    royal: false,
  },
  joker: {
    rank1: false,
    rank2: false,
    rank3: false,
    rank4: false,
  },
  "joker-rare": {
    rank1: false,
    rank2: false,
    rank3: false,
    rank4: false,
  },
};

// listen for the doms elements to be loaded
document.addEventListener(
  "DOMContentLoaded",
  () => {
    console.log("document onload");
    updateCollection();
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
  if (card.suit === "joker-rare") {
    setTimeout(() => {
      const cardElement = document.getElementById(cardId);
      cardElement.classList.add("slow-animation");
    }, 3000);
  }
}

function changeScore(card) {
  if (card.suit !== "joker" && card.suit !== "joker-rare") {
    if (card.rank <= 15) {
      if (!collection[card.suit].standard) {
        collection[card.suit].standard = true;
        localStorage.setItem("standard", standard);
        document.getElementById("standard-count").textContent =
          (standard !== 11 ? ++standard : standard) + "/11";
      }
    } else if (card.rank <= 22 && card.rank >= 16) {
      if (!collection[card.suit].standard) {
        collection[card.suit].bronze = true;
        localStorage.setItem("bronze", bronze);
        document.getElementById("bronze-count").textContent =
          (bronze !== 11 ? ++bronze : bronze) + "/11";
      }
    } else if (card.rank <= 26 && card.rank >= 23) {
      if (!collection[card.suit].silver) {
        collection[card.suit].silver = true;
        localStorage.setItem("silver", silver);
        document.getElementById("silver-count").textContent =
          (silver !== 11 ? ++silver : silver) + "/11";
      }
    } else if (card.rank <= 29 && card.rank >= 27) {
      if (!collection[card.suit].gold) {
        collection[card.suit].gold = true;
        localStorage.setItem("gold", gold);
        document.getElementById("gold-count").textContent =
          (gold !== 11 ? ++gold : gold) + "/11";
      }
    } else if (card.rank === 30) {
      if (!collection[card.suit].royal) {
        collection[card.suit].royal = true;
        localStorage.setItem("royal", royal);
        document.getElementById("royal-count").textContent =
          (royal !== 11 ? ++royal : royal) + "/11";
      }
    }
  } else if (card.suit === "joker-rare") {
    if (collection[card.suit][`rank${card.rank}`]) {
      collection[card.suit][`rank${card.rank}`] = true;
      localStorage.setItem("ultrarare", ultrarare);
      document.getElementById("ultrarare-count").textContent =
        (ultrarare !== 4 ? ++ultrarare : ultrarare) + "/4";
    }
  } else {
    if (collection[card.suit][`rank${card.rank}`]) {
      collection[card.suit][`rank${card.rank}`] = true;
      localStorage.setItem("rare", rare);
      document.getElementById("rare-count").textContent =
        (rare !== 4 ? ++rare : rare) + "/4";
    }
  }
  localStorage.setItem("collection", collection);
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

function updateCollection() {
  document.getElementById("standard-count").textContent = `${standard}/11`;
  document.getElementById("bronze-count").textContent = `${bronze}/11`;
  document.getElementById("silver-count").textContent = `${silver}/11`;
  document.getElementById("gold-count").textContent = `${gold}/11`;
  document.getElementById("royal-count").textContent = `${royal}/11`;
  document.getElementById("rare-count").textContent = `${rare}/4`;
  document.getElementById("ultrarare-count").textContent = `${ultrarare}/4`;
}
