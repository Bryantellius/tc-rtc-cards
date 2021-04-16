const cards = [];
let id = 0;
let socket = null;
let serverUrl = `${window.location.hostname}:${window.location.port}`;
let computerId = window.location.href.slice(window.location.href.length - 5);
let compassDiff = 0;
let compassDir = 0;
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

    // Obtain a new *world-oriented* Full Tilt JS DeviceOrientation Promise
    var promise = FULLTILT.getDeviceOrientation({ type: "world" });

    // Wait for Promise result
    promise
      .then(function (deviceOrientation) {
        // Device Orientation Events are supported

        // Register a callback to run every time a new
        // deviceorientation event is fired by the browser.
        deviceOrientation.listen(function () {
          // Get the current *screen-adjusted* device orientation angles
          var currentOrientation = deviceOrientation.getScreenAdjustedEuler();

          // Calculate the current compass heading that the user is 'looking at' (in degrees)
          compassDir = 360 - currentOrientation.alpha;
        });
      })
      .catch(function (errorMessage) {
        // Device Orientation Events are not supported
        console.log(errorMessage);
        // Implement some fallback controls here...
        let errorFlash = document.getElementById("errorFlash");
        errorFlash.textContent = errorMessage;
        errorFlash.classList.add("show");
        setTimeout(() => errorFlash.classList.remove("show"), 5000);
      });

    // update phone direction every 100ms
    setInterval(() => {
      socket.emit("phone-move", { computerId, angle: getCompassDirection() });
    }, 100);
  },
  false
);

// ===== Card Functions =====
function addCard() {
  // repopulates the deck with new cards
  let randomCard = getRandomCard();
  let card = {
    id: `card${id++}`,
    suit: randomCard.suit,
    rank: randomCard.rank,
  };
  cards.push(card);

  document.getElementById("touchHandler").innerHTML += `<div class="item">
        <div id="${card.id}" class="card ${card.suit} rank${card.rank}">
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
    addCard();
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
}

function touchMove(e, x, y, offsetX, offsetY) {
  e.preventDefault();
}

function touchEnd(x, y, offsetX, offsetY, timeTaken) {
  // set 10px as min threshold for swipe
  if (-offsetY < 10) {
    return;
  }

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

function getRandomCard() {
  return {
    suit: getRandomSuit(),
    rank: getRandomNumber(1, 13),
  };
}

function getRandomSuit() {
  const suits = ["hearts", "spades", "clubs", "diamonds"];
  return suits[getRandomNumber(0, 3)];
}

// ===== Service Functions

function createCards(n) {
  for (let i = 0; i < n; i++) {
    addCard();
  }
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getCompassDirection() {
  let val = (compassDir - compassDiff + 360) % 360;
  if (val >= 0 && val < 180) {
    return Math.min(val, 90);
  } else {
    return Math.max(val, 270);
  }
}

function calibrate() {
  document.getElementById("touchHandler").classList.add("calibrated");
  document.getElementById("waiting-for-calibration").remove();
  compassDiff = compassDir;
}
