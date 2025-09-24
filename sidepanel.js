document.addEventListener("DOMContentLoaded", () => {
  const mainMenu = document.getElementById("main-menu");
  const playSubmenu = document.getElementById("play-submenu");
  const filterSubmenu = document.getElementById("filter-submenu");
  const notifySubmenu = document.getElementById("notify-submenu");
// Handle "Start" and "Pause" buttons
  const startButton = document.getElementById("start");
  const pauseButton = document.getElementById("pause");


  const menus = {
    "play-menu": playSubmenu,
    "filter-menu": filterSubmenu,
    "notify-menu": notifySubmenu,
  };

  // Show submenu and hide main menu
  Object.keys(menus).forEach(menuId => {
    document.getElementById(menuId).addEventListener("click", () => {
      mainMenu.classList.remove("active");
      menus[menuId].classList.add("active");
    });
  });

  // Back to main menu
  document.querySelectorAll(".back").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".submenu").forEach(submenu => submenu.classList.remove("active"));
      mainMenu.classList.add("active");
    });
  });

  // Log button clicks
  document.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", () => {
      if (!button.classList.contains("back") && !button.disabled) {
        console.log(`Gomb megnyomva : ${button.textContent}`);
      }
    });
  });




startButton.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: 'start' }, function(resp) {
    // opcionális: státusz visszajelzés
  });
  navigator.serviceWorker.getRegistration().then(registration => {
    if (registration) {
      registration.active.postMessage({ action: "start" });
      console.log("Message sent: start");
    } else {
      console.error("background.js is not running.");
    }
  });
});

pauseButton.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: 'pause' }, function(resp) {
    // opcionális: státusz visszajelzés
  });
  navigator.serviceWorker.getRegistration().then(registration => {
    if (registration) {
      registration.active.postMessage({ action: "pause" });
      console.log("Message sent: pause");
    } else {
      console.error("background.js is not running.");
    }
  });
});


// LastId megjelenítése a sidepanelen ha változik
  const savedList = document.getElementById('savedList');


  let lastIDPS = null;

  chrome.storage.session.get('LastID').then(result => {
    lastIDPS = result.LastID;
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'session' && changes.LastID) {
      lastIDPS = changes.LastID.newValue;
      console.log('LastID changed, new value:', lastIDPS);
      savedList.innerHTML = lastIDPS;
      // További műveletek itt
    }
  });

});  // end of EventListener("DOMContentLoaded",