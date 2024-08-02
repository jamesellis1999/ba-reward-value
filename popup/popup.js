const aviosValueRadios = document.getElementsByName("avios-value");
const customAviosRadio = document.getElementById("radio-custom-value");
const customInput = document.getElementById("custom-input");
const customInputError = document.getElementById("custom-input-error")

aviosValueRadios.forEach((radio) => {
    radio.addEventListener("change", (event) => {
        if (radio.value === "custom") {
            customInput.disabled = false;
            chrome.storage.local.get(["customAviosValue"], (result) => {
                const {customAviosValue} = result;
                if (customAviosValue){
                    chrome.storage.local.set({aviosValue: customAviosValue});
                };
            })         
        } else {
            customInput.disabled = true;
            chrome.storage.local.set({aviosValue: event.target.value});
        };
        chrome.storage.local.set({aviosValueRadioId: event.target.id});
    })
});

chrome.storage.local.get(["aviosValueRadioId", "customAviosValue"], (result) => {
    const {aviosValueRadioId, customAviosValue} = result;
    if (aviosValueRadioId){
        const selectedRadio = document.getElementById(aviosValueRadioId);
        selectedRadio.click();
    };

    if (customAviosValue){
        customInput.value = customAviosValue;
    }
});

customInput.addEventListener("change", () => {
    customInput.classList.remove('error');
    if (customInput.value >= 0 && customInput.value <= 5) {
        chrome.storage.local.set({customAviosValue: customInput.value});
        chrome.storage.local.set({aviosValue: customInput.value});
        customInputError.classList.remove('error');
    } else {
        customInput.classList.add('error');
        customInputError.classList.add("error");
    }
});