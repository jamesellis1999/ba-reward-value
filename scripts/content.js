const targetNode = document.querySelector("div.totalestimated");
const moneyAviosReg = new RegExp(/(\d+)\sAvios[\+\s]+£\s+([\d\.,]+)/);

function appendAviosValue(priceElement) {

  const moneyAvios = moneyAviosReg.exec(priceElement.textContent);

  const avios = Number(moneyAvios[1]);
  const money = Number(moneyAvios[2].replaceAll(",", ""));
  const value = ((avios * 0.0092) + money).toFixed(2);

  priceElement.textContent += ` (£${value})`;

}

if (targetNode) {
  // Options for the observer (which mutations to observe)
  const config = { childList: true, subtree: true };

  // Callback function to execute when mutations are observed
  const callback = (mutationList, observer) => {

    for (const mutation of mutationList) {
      if (mutation.type === "childList") {
        
        for (const addNode of mutation.addedNodes) {
          if (!(addNode instanceof Element)) {
            // Do nothing
          }
          else if (addNode instanceof Element && addNode.getAttribute("name") === "totalPriceAvios") {
            const child_span = addNode.querySelector("span.totalPriceAviosTxt");
            appendAviosValue(child_span);

          } else if (addNode.getAttribute("id") === "more-pricing") {
            const otherPriceElements = addNode.querySelectorAll("li.lstStyleSB");
            for (const priceElement of otherPriceElements){
              appendAviosValue(priceElement);
            }
          } 
        }
      }
    }
  };

  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(callback);

  // Start observing the target node for configured mutations
  observer.observe(targetNode, config);

};