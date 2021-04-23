const serverUrl = window.location.host;
let optionBtn;
let selfPlay;
let clickBtn;
let showingCollection = false;
let computerId = generateId();
let totalCardCount = 0;
let id = 0;
let standard = localStorage.getItem("standard") || 0;
let bronze = localStorage.getItem("bronze") || 0;
let silver = localStorage.getItem("silver") || 0;
let gold = localStorage.getItem("gold") || 0;
let royal = localStorage.getItem("royal") || 0;
let rare = localStorage.getItem("rare") || 0;
let ultrarare = localStorage.getItem("ultrarare") || 0;
const collection = JSON.parse(localStorage.getItem("collection")) || {
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
    a: false,
    b: false,
    c: false,
    d: false,
  },
  "joker-rare": {
    a: false,
    b: false,
    c: false,
    d: false,
  },
};

// listen for the doms elements to be loaded
document.addEventListener(
  "DOMContentLoaded",
  () => {
    console.log("document onload");

    // Experimental!
    // checkOrientation();

    selfPlay = document.getElementById("self-play");
    optionBtn = document.getElementById("optionBtn");
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
    const url = `https://${serverUrl}/?id=${computerId}`;
    qrCodeGenerator(url, "placeholder");

    // display the url on the dom
    document.getElementById("url").innerHTML = url;

    // ???
    document.getElementById("b").addEventListener("click", forB);
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
  if (showingCollection) {
    hideCollection();
  }
  // adds the throw card to the computer display
  let cardId = `card${id++}`;
  addCard(cardId, card.angle, card.suit, card.rank);
  changeScore(card);
  console.log(card.suit, card.rank);
  if (!card.strength) {
    card.strength = Math.floor(Math.random() * 50 + 25);
  }
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
  if (card.suit !== "joker" && card.suit !== "joker-rare") {
    if (card.rank === "standard") {
      if (!collection[card.suit].standard) {
        console.log("standard");
        collection[card.suit].standard = true;
        document.getElementById("standard-count").textContent =
          (standard >= 11 ? standard : ++standard) + "/11";
        localStorage.setItem("standard", standard);
      }
    } else if (card.rank === "bronze") {
      if (!collection[card.suit].bronze) {
        console.log("bronze");
        collection[card.suit].bronze = true;
        document.getElementById("bronze-count").textContent =
          (bronze >= 11 ? bronze : ++bronze) + "/11";
        localStorage.setItem("bronze", bronze);
      }
    } else if (card.rank === "silver") {
      if (!collection[card.suit].silver) {
        console.log("silver");
        collection[card.suit].silver = true;
        document.getElementById("silver-count").textContent =
          (silver >= 11 ? silver : ++silver) + "/11";
        localStorage.setItem("silver", silver);
      }
    } else if (card.rank === "gold") {
      if (!collection[card.suit].gold) {
        console.log("gold");
        collection[card.suit].gold = true;
        document.getElementById("gold-count").textContent =
          (gold >= 11 ? gold : ++gold) + "/11";
        localStorage.setItem("gold", gold);
      }
    } else if (card.rank === "royal") {
      if (!collection[card.suit].royal) {
        console.log("royal");
        collection[card.suit].royal = true;
        document.getElementById("royal-count").textContent =
          (royal >= 11 ? royal : ++royal) + "/11";
        localStorage.setItem("royal", royal);
      }
    }
  } else if (card.suit === "joker-rare") {
    if (!collection[card.suit][`${card.rank}`]) {
      console.log("ultrarare");
      collection[card.suit][`${card.rank}`] = true;
      document.getElementById("ultrarare-count").textContent =
        (ultrarare >= 4 ? ultrarare : ++ultrarare) + "/4";
      localStorage.setItem("ultrarare", ultrarare);
    }
  } else {
    if (!collection[card.suit][`${card.rank}`]) {
      console.log("rare");
      collection[card.suit][`${card.rank}`] = true;
      document.getElementById("rare-count").textContent =
        (rare >= 4 ? rare : ++rare) + "/4";
      localStorage.setItem("rare", rare);
    }
  }
  localStorage.setItem("collection", JSON.stringify(collection));
}

function phoneConnected() {
  // once a phone connects, remove the "waiting for..." element
  document.getElementById("waiting-for-device").remove();
}

function addCard(id, angle, suit, rank) {
  console.log("card angle: ", angle);
  document.body.innerHTML += `<div class="path" style="transform: rotate(${angle}deg)"><div id="${id}" class="card ${suit} ${rank}"><div class="face"/></div></div>`;
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

function showCollection(rank) {
  if (showingCollection) {
    return;
  }
  showingCollection = true;
  const collectionDiv = document.getElementById("collection");
  const cancelDiv = document.getElementById("cancel");
  cancelDiv.addEventListener("click", hideCollection);
  cancelDiv.classList.add("show-cancel");
  collectionDiv.classList.add("show-collection");
  if (rank === "joker" || rank === "joker-rare") {
    for (let suit in collection[rank]) {
      if (collection[rank][suit]) {
        collectionDiv.innerHTML += `<div class="flex-item"><div class="card ${suit} ${rank}"><div class="face"/></div></div>`;
      } else if (collection[rank][suit] === false) {
        collectionDiv.innerHTML += `<div class="flex-item"><div class="card"><div class="face"/></div></div>`;
      }
    }
  } else {
    for (let suit in collection) {
      if (collection[suit][rank]) {
        collectionDiv.innerHTML += `<div class="flex-item"><div class="card ${suit} ${rank}"><div class="face"/></div></div>`;
      } else if (collection[suit][rank] === false) {
        collectionDiv.innerHTML += `<div class="flex-item"><div class="card"><div class="face"/></div></div>`;
      }
    }
  }
}

function hideCollection() {
  showingCollection = false;
  const collectionDiv = document.getElementById("collection");
  const cancelDiv = document.getElementById("cancel");
  cancelDiv.classList.remove("show-cancel");
  collectionDiv.classList.remove("show-collection");
  collectionDiv.innerHTML = "";
}

function showSelfPlay() {
  selfPlay.classList.add("show-self-play");
  selfPlay.innerHTML += `<div id="clickBtn" onclick="throwCard(createCard())" class="flex-item"><div class="card standard"><div class="face">+</div></div></div>`;
  optionBtn.removeEventListener("click", showSelfPlay);
  phoneConnected();
}

function createCard(ultra, rank) {
  console.log(totalCardCount);
  let randomCard;
  if (totalCardCount === 200 && !rank) {
    randomCard = getRandomCard("joker-rare", "c");
    totalCardCount = 0;
  } else randomCard = getRandomCard(ultra);
  totalCardCount++;
  return {
    id: `card${id++}`,
    suit: randomCard.suit,
    rank: rank || randomCard.rank,
    angle: Math.floor(Math.random() * 45 + 15) - 25,
  };
}

function getRandomCard(ultra, rank) {
  const suit = getRandomSuit();
  if (!ultra && suit === "joker") ultra = suit;
  return {
    suit: ultra || suit,
    rank: rank || getRandomRank(ultra),
  };
}

function getRandomSuit() {
  let odds = Math.floor(Math.random() * 1000) + 1;
  let joker = 990 <= odds;
  const people = [
    "Ben",
    "John",
    "Tanner",
    "Cruz",
    "Michael",
    "Hampton",
    "Jeremy",
    "Denise",
    "Whit",
    "Martin",
    "Mike",
  ];
  return joker
    ? "joker"
    : people[Math.floor(Math.random() * people.length - 1) + 1];
}

function getRandomRank(ultra) {
  const ranks = {
    normal: [
      "royal",
      "gold",
      "gold",
      "silver",
      "silver",
      "silver",
      "bronze",
      "bronze",
      "bronze",
      "standard",
    ],
    joker: ["a", "b", "c", "d"],
  };
  if (ultra === "joker" || ultra === "joker-rare") {
    return ranks["joker"][Math.floor(Math.random() * 4)];
  } else {
    let prop = Math.floor(Math.random() * 12);
    let addedProp = Math.floor(Math.random() * 12);
    let final = prop + addedProp;
    return ranks["normal"][final > 9 ? 9 : final];
  }
}

function checkOrientation() {
  console.log(
    "check ori",
    window.matchMedia("(orientation: portrait)").matches
  );
  const ori = document.getElementById("orientationMessage");
  if (window.matchMedia("(orientation: portrait)").matches) {
    ori.classList.add("show-ori-message");
  } else {
    // you're in LANDSCAPE mode
    ori.classList.remove("show-ori-message");
  }

  window.addEventListener("orientationchange", checkOrientation);
}

function forB() {
  console.log("JOKER-RARE B");
  if (totalCardCount > 0 && !collection["joker-rare"]["b"]) {
    throwCard(createCard("joker-rare", "b"));
  }
}
