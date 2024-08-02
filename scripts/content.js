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

const runProcess = () => {
  elementsModified = false;

  const mainPrice = document.getElementsByClassName('totalPriceAviosTxt');
  if (mainPrice.length > 0) {
    chrome.storage.local.get({"aviosValue": 1}, (result) => {
      const aviosValue = result.aviosValue;
      appendAviosValue(mainPrice, aviosValue);
    });
    elementsModified = true;
  };

  const otherPrices = document.getElementsByClassName('lstStyleSB');
  if (otherPrices.length > 0) {
    chrome.storage.local.get({"aviosValue": 1}, (result) => {
      const aviosValue = result.aviosValue;
      appendAviosValue(otherPrices, aviosValue);
    });
    elementsModified = true;
  };

  return elementsModified;
};


const priceObserver = new MutationObserver(() => {
  disconnect = runProcess()

  if (disconnect) {
    console.log("Attempting disconnect");
    priceObserver.disconnect();
    console.log("Disconnect successful");
  }
});


const buttonObserver = new MutationObserver(() => {
  const buttons = document.getElementsByClassName("flightOption-size1-0 flight-cabin-detail seats-available");
  const partnerButtons = document.getElementsByClassName("flightOption-size2-0 flight-cabin-detail seats-available");

  if (buttons.length > 0 || partnerButtons.length > 0) {
    buttonObserver.disconnect();
    for (const button of buttons) {
      button.addEventListener("click", () => {
        console.log("Adding price event listener to button");
        priceObserver.observe(document.body, { childList: true, subtree: true });
      })
    };
    for (const partnerButton of partnerButtons) {
      partnerButton.addEventListener("click", () => {
        console.log("Adding price event listener to partner button");
        priceObserver.observe(document.body, { childList: true, subtree: true });
      })
    };
  }
});

buttonObserver.observe(document.body, { childList: true, subtree: true });

chrome.storage.onChanged.addListener((changes, namespace) => {
  for (let [key, _] of Object.entries(changes)) {
    if (key === "aviosValue") {
      runProcess();
      return;
    };
  };
});