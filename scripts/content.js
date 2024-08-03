const moneyAviosReg = new RegExp(/(\d+)\sAvios[\+\s]+£\s+([\d\.,]+)/);

function appendAviosValue(priceElements, aviosValue) {
  for (const elm of priceElements) {
    const moneyAvios = moneyAviosReg.exec(elm.textContent);

    const avios = Number(moneyAvios[1]);
    const money = Number(moneyAvios[2].replaceAll(",", ""));
    const value = ((avios * (aviosValue/100)) + money).toFixed(2);

    const spanId = `${avios}-${money}`;
    const currentValue = document.getElementById(spanId);

    if (currentValue) {
      currentValue.remove();
    };

    const newValue = document.createElement("span");
    newValue.setAttribute("id", spanId);
    newValue.setAttribute("style", "display:inline");
    newValue.textContent = ` (£${value})`;
    elm.appendChild(newValue);
  }
}

async function flightSelectProcess() {

  const {aviosValue} = await chrome.storage.local.get({"aviosValue": 1})

  const mainPrice = document.getElementsByClassName('totalPriceAviosTxt');
  appendAviosValue(mainPrice, aviosValue);

  const otherPrices = document.getElementsByClassName('lstStyleSB');
  appendAviosValue(otherPrices, aviosValue);
};

async function flightQuoteProcess() {

  const {aviosValue} = await chrome.storage.local.get({"aviosValue": 1})

  const quotes = document.querySelectorAll('div.aviosVoucherWrapper.radio > * > span');

  appendAviosValue(quotes, aviosValue);
};

const priceObserver = new MutationObserver(() => {
  // Separate observer as these take a bit to load

  const pricesAvailable = document.getElementById("lstMrePrcngSB");

  if (pricesAvailable) {
    const promise = flightSelectProcess()
    promise.then(() => {
      priceObserver.disconnect();
    })
  }
});

const documentObserver = new MutationObserver(() => {

  const flightSelectHeader = document.getElementById('sector_1');

  if (flightSelectHeader) {
    const buttons = document.getElementsByClassName("flight-cabin-detail seats-available");
    documentObserver.disconnect();
    // Better just to loop?
    Array.from(buttons).forEach((button) => {
      button.addEventListener("click", () => {
        console.log("Adding price event listener to button");
        priceObserver.observe(document.body, { childList: true, subtree: true });
      })
    }
  )
  };

  // Look for quote on the second page
  const quoteHeader = document.getElementById("priceQuoteTitle");

  if (quoteHeader) {
    documentObserver.disconnect();
    flightQuoteProcess();
  }
});

documentObserver.observe(document.body, { childList: true, subtree: true });

chrome.storage.onChanged.addListener((changes, _) => {
  for (let [key, _] of Object.entries(changes)) {
    if (key === "aviosValue") {
      if (document.getElementById('sector_1')) {
        flightSelectProcess();
      } else if (document.getElementById("priceQuoteTitle")) {
        flightQuoteProcess();
      };
      return;
    };
  };
});