// background.js - Chrome Extension (Manifest V3)

// Konfiguráció
const CONFIG = {
 
  START_ID: 1208557,
  NOID : 0,  

  BASE_URL: 'https://www.automobile.at/boerse/expose/',

  CHECK_INTERVAL: 150, // 10 másodperc várakozás kérek között
  STORAGE_KEY: 'URL_data'
};

// Állítsuk a LastID-t az URLData legnagyobb, létező (exists=true) azonosítójára
function updateLastIDFromURLData() {
  try {
    const candidateIds = Object.keys(URLData)
      .filter((key) => URLData[key] && URLData[key].exists === true)
      .map((key) => Number(key))
      .filter((n) => Number.isFinite(n));
    if (candidateIds.length > 0) {
      const maxId = Math.max(...candidateIds);
      LastID = maxId;
      saveLastIDToSession();
      console.log('LastID frissítve az URLData alapján:', LastID);
    }
  } catch (e) {
    console.error('Nem sikerült LastID-t frissíteni URLData-ból:', e);
  }
}


  // Fő változó az adatok tárolására
let URLData = {};
let LastID = CONFIG.START_ID;
let isChecking = false;
let shouldContinue = false;

function saveLastIDToSession() {
  if (typeof LastID === 'number') {
    chrome.storage.session.set({ LastID });
  }
}

// Extension indításakor
chrome.runtime.onStartup.addListener(() => {
  loadStoredData();
  updateLastIDFromURLData();
  // Ne induljon automatikusan; a side panelről indítjuk
});


// Extension install/update esetén
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  LastID = CONFIG.START_ID;
  // Indítás kézzel történik a side panelről
});

// Adatok betöltése localStorage-ből
function loadStoredData() {
  chrome.storage.local.get([CONFIG.STORAGE_KEY], (result) => {
    if (result[CONFIG.STORAGE_KEY]) {
      URLData = result[CONFIG.STORAGE_KEY];
      console.log('Adatok betöltve:', Object.keys(URLData).length, 'elem');
    } else {
      // Nincs tárolt adat: állítsunk alapértelmezett START_ID értéket
            LastID = CONFIG.START_ID;
      saveLastIDToSession();
      console.log('Nincs tárolt adat. Alapértelmezett START_ID beállítva:', CONFIG.START_ID);
    }
  });
}

// Adatok mentése localStorage-ba
function saveData() {
  chrome.storage.local.set({ [CONFIG.STORAGE_KEY]: URLData }, () => {
    //console.log('Adatok elmentve:', Object.keys(URLData).length, 'elem');
  });
}

// URL ellenőrzése fetch-el
async function checkUrl(id) {
  if (CONFIG.NOID > 15) {id=id-20 ; CONFIG.NOID=0; LastID=id}
  const url = `${CONFIG.BASE_URL}${id}`;

  try {
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    if (response.status === 429) {
      console.log(`ID ${id}: 429  várakozás: 60 másodperc`);
      await new Promise(resolve => setTimeout(resolve, 61000));
      await checkUrl(id);
      return false;
    }
    if (response.status === 302) {
      console.log(`ID ${id}: 302 capchac`);
  // Nyissuk meg az URL-t egy új Chrome fülön
  try {
    chrome.tabs.create( url );
  } catch (e) {
    console.error('Nem sikerült megnyitni a lapot:', e);
  }
  
      await new Promise(resolve => setTimeout(resolve, 60000));
      await checkUrl(id);
      return false;
    }

    if (response.status === 200) {
      //console.log(`ID ${id}: LÉTEZIK (200)`);
      CONFIG.NOID = 0
      // Ha szeretnéd a teljes tartalmat is, használd ezt:
      /*
      const fullResponse = await fetch(url);
      const content = await fullResponse.text();
      autoData[id] = {
        exists: true,
        url: url,
        content: content,
        timestamp: new Date().toISOString()
      };
      */

      URLData[id] = {
        exists: true,
        url: url,
        timestamp: new Date().toISOString(),
        ELEMData: ""
      };

      
    // Frissítsük és mentsük az aktuális LastID értéket a session tárolóba
    LastID = id;
    saveLastIDToSession();

      saveData();
    

      return true;
    } else {
      //console.log(`ID ${id}: Nem létezik (${response.status}) ${url}  `);
      CONFIG.NOID ++
      URLData[id] = {
        exists: false,
        url: url,
        timestamp: new Date().toISOString(),
        ELEMData: ""
      };
      return false;
    }
  } catch (error) {
    console.error(`ID ${id}: Hiba -`, error.message);
    CONFIG.NOID ++
    URLData[id] = {
      exists: false,
      url: url,
      error: error.message,
      timestamp: new Date().toISOString()
    };
    return false;
  }
}

// Fő ellenőrző függvény
async function startChecking() {
  if (isChecking) {
    console.log('Ellenőrzés már fut.');
    return;
  }
  shouldContinue = true;
  isChecking = true;
  console.log('Autó adatok ellenőrzése elkezdődött...');
  loadStoredData();
  updateLastIDFromURLData();
  broadcastStatus();
  console.log('Autó adatok loaded from storidge');
  for (let id = LastID; shouldContinue && id <= LastID + 20000; id++) {
    // Ha már ellenőriztük korábban, kihagyjuk
    if (URLData[id] && URLData[id].exists !== undefined) {
      console.log(`ID ${id}: Már ellenőrizve korábban`);
      continue;
    }

    if (!shouldContinue) break;
    await checkUrl(id);
    if (!shouldContinue) break;

    // Várakozás a következő kérés előtt
    await new Promise(resolve => setTimeout(resolve, CONFIG.CHECK_INTERVAL));
  }

  isChecking = false;
  console.log('Ellenőrzés befejeződött vagy leállítva');
  broadcastStatus();
}

function pauseChecking() {
  if (!isChecking) {
    console.log('Nincs futó ellenőrzés.');
  }
  shouldContinue = false;
  broadcastStatus();
}

// Külső hívások kezelése (pl. popup-ból)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'start':
      startChecking();
      sendResponse({ status: 'started' });
      break;

    case 'pause':
      pauseChecking();
      sendResponse({ status: 'stopped' });
      break;

    case 'getStatus':
      sendResponse({ isChecking, shouldContinue });
      break;

    case 'getData':
      sendResponse({ data: URLData, count: Object.keys(URLData).length });
      break;

    case 'clearData':
      URLData = {};
      chrome.storage.local.remove([CONFIG.STORAGE_KEY], () => {
        sendResponse({ status: 'cleared' });
      });
      break;

    default:
      sendResponse({ error: 'Ismeretlen művelet' });
  }

  return true; // Aszinkron válaszhoz szükséges
});

function broadcastStatus() {
  try {
    chrome.runtime.sendMessage({ type: 'status', isChecking, shouldContinue });
  } catch (e) {
    // No listeners available; ignore
  }
}

// Periodikus ellenőrzés (opcionális)
/*
setInterval(() => {
  console.log('Periodikus ellenőrzés...');
  startChecking();
}, 3600000); // Óránként
*/