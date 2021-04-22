const cards = [];
let id = 0;
let socket = null;
let serverUrl = `${window.location.hostname}:${window.location.port}`;
let computerId = window.location.href.slice(window.location.href.length - 5);
let compassDiff = 0;
let compassDir = 0;
let touchStartX = 0;
let touchEndX = 0;
let totalCardCount = 0;
let isCompassAttached = false;

// listen for the DOM elements to be loaded
document.addEventListener(
  "DOMContentLoaded",
  () => {
    // initialize cards
    createCards(10);
    // connect to the websocket server
    socket = io.connect(serverUrl, { transports: ["websocket"] });
    // emit a message detailing a phone connection
    socket.emit("phone-connect", computerId);

    // initialize touch event handling for card angles
    const touchTrack = new TouchTrack();
    touchTrack.init(
      document.getElementById("touchHandler"),
      touchStart,
      touchMove,
      touchEnd
    );

    let errorFlash = document.getElementById("errorFlash");
    errorFlash.textContent = "Swipe up on the card!";
    errorFlash.classList.add("show");
    setTimeout(() => errorFlash.classList.remove("show"), 5000);

    // document.getElementById("s").addEventListener("touchstart", forS);
    document.getElementById("s").addEventListener("click", forS);
  },
  false
);

// ===== Card Functions =====
function addCard(ultra, rank) {
  // repopulates the deck with new cards
  let randomCard = getRandomCard(ultra);
  let card = {
    id: `card${id++}`,
    suit: randomCard.suit,
    rank: rank || randomCard.rank,
  };
  cards.push(card);

  document.getElementById("touchHandler").innerHTML += `<div class="item">
        <div id="${card.id}" class="card ${card.suit} ${card.rank}">
            <div class="face"/>
        </div>
    </div>`;
}

function removeCard(id, strength) {
  // handles a card being removed from the phone
  // set to take 500ms for animation duration
  if (cards.length === 0) {
    return;
  }
  let card = cards[0];
  cards.splice(0, 1);
  setTimeout(() => {
    document.getElementById(id).parentElement.remove();
    totalCardCount++;
    if (totalCardCount === 200) {
      addCard("joker-rare", "c");
      totalCardCount = 0;
    } else addCard();
    socket.emit("phone-throw-card", {
      computerId,
      suit: card.suit,
      rank: card.rank,
      angle: getCompassDirection(),
      strength,
    });
  }, 500);
}

// ===== Swipe Events (mobile)
function touchStart(x, y) {
  // doesn't do anything

  touchStartX = Math.round(x);
}

function touchMove(e, x, y, offsetX, offsetY) {
  e.preventDefault();
}

function touchEnd(x, y, offsetX, offsetY, timeTaken) {
  // set 10px as min threshold for swipe
  if (-offsetY < 10) {
    return;
  }

  touchEndX = Math.round(x);

  // add 'move' class to animate
  let card = cards[0];
  const cardElement = document.getElementById(card.id);
  cardElement.classList.add("move");

  // calculate strength (velocity of card throw)
  // 2000+ pixels per second = 100% strength
  let distanceY = -offsetY;
  let pps = Math.trunc((distanceY * 1.0) / (timeTaken / 1000));
  let min = Math.min(2000, pps);
  let percentage = Math.trunc((min / 2000) * 100);

  removeCard(card.id, percentage);
}

// ===== Random Cards

function getRandomCard(ultra) {
  const suit = getRandomSuit();
  if (!ultra && suit === "joker") ultra = suit;
  return {
    suit: ultra || suit,
    rank: getRandomRank(ultra),
  };
}

function getRandomSuit() {
  let odds = Math.floor(Math.random() * 1000) + 1;
  let joker = 995 <= odds;
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

// ===== Service Functions

function createCards(n) {
  for (let i = 0; i < n; i++) {
    totalCardCount++;
    addCard();
  }
}

function forS() {
  console.log(cards[0]);
  if (cards[0].suit === "joker") {
    addCard("joker-rare", "a");
  }
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

function getCompassDirection() {
  console.log("touchStartX: ", touchStartX);
  console.log("touchEndX: ", touchEndX);
  let val = (touchEndX - touchStartX + 360) % 360;
  if (val >= 0 && val < 180) {
    return Math.min(val, 70);
  } else {
    return Math.max(val, 250);
  }
}

function calibrate() {
  document.getElementById("touchHandler").classList.add("calibrated");
  document.getElementById("waiting-for-calibration").remove();
  compassDiff = compassDir;
}
