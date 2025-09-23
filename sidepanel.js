
document.addEventListener('DOMContentLoaded', function() {
  const menu = document.getElementById('menu');
  const featureView = document.getElementById('featureView');
  const featureTitle = document.getElementById('featureTitle');
  const notifier = document.getElementById('notifier');
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const backBtn = document.getElementById('backBtn');
  const statusBadge = document.getElementById('statusBadge');
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

// Load recent saved items from storage
  function loadRecentItems() {
    loadStoredData()
    savedList.innerHTML = '';
    //   console.log("sss")
    //    Filter and sort items
    const htmlItems = [];
    for (let key in URLData) {
      htmlItems.push({
        key: key,
        data: URLData[key]
      });
    }

    //    Sort by timestamp (newest first)
    htmlItems.sort((a, b) =>
        new Date(b.data.timestamp) - new Date(a.data.timestamp)
    );

    // Display recent items (max 5)
    const displayItems = htmlItems.slice(0, 5);
    if (displayItems.length === 0) {
      savedList.innerHTML = '<p>No saved HTML yet</p>';
      return;
    }

    displayItems.forEach(item => {
      const div = document.createElement('div');
      div.className = 'saved-item';
      div.innerHTML = `
            <strong>${item.data.ELEMData} ${item.data.exists}</strong><br>
        <small>${new Date(item.data.timestamp).toLocaleString()}  ${item.data.url}</small>
        `;
      savedList.appendChild(div);
    });

  }


  function showNotifier(message) {
    notifier.textContent = message;
    notifier.style.display = 'block';
    clearTimeout(showNotifier._t);
    showNotifier._t = setTimeout(() => {
      notifier.style.display = 'none';
    }, 2000);
  }

  function openFeature(title) {
    featureTitle.textContent = title;
    menu.classList.remove('active');
    featureView.classList.add('active');
  }

  function backToMenu() {
    featureView.classList.remove('active');
    menu.classList.add('active');
  }

  function setRunningUI(isRunning) {
    if (!statusBadge) return;
    if (isRunning) {
      statusBadge.textContent = 'Running';
      statusBadge.classList.add('status-running');
      statusBadge.classList.remove('status-stopped');
      startBtn.disabled = true;
      stopBtn.disabled = false;
    } else {
      statusBadge.textContent = 'Stopped';
      statusBadge.classList.add('status-stopped');
      statusBadge.classList.remove('status-running');
      startBtn.disabled = false;
      stopBtn.disabled = true;
    }
  }

  // Menu buttons
  menu.addEventListener('click', function(ev) {
    const button = ev.target.closest('button[data-feature]');
    if (!button) return;
    if (button.hasAttribute('data-disabled')) {
      showNotifier('under develope');
      return;
    }
    const title = button.getAttribute('data-feature');
    showNotifier('gomb megnyomva');
    openFeature(title);
  });

  startBtn.addEventListener('click', function() {
    showNotifier('gomb megnyomva');
    chrome.runtime.sendMessage({ action: 'startCheck' }, function(resp) {
      // opcionális: státusz visszajelzés
    });
    setRunningUI(true);
  });

  stopBtn.addEventListener('click', function() {
    showNotifier('gomb megnyomva');
    chrome.runtime.sendMessage({ action: 'stopCheck' }, function(resp) {
      // opcionális: státusz visszajelzés
    });
    setRunningUI(false);
  });

  backBtn.addEventListener('click', function() {
    showNotifier('gomb megnyomva');
    backToMenu();
  });

  // Init status from background
  chrome.runtime.sendMessage({ action: 'getStatus' }, function(resp) {
    if (resp && typeof resp.isChecking === 'boolean') {
      setRunningUI(resp.isChecking);
    }
  });

  // Listen to live status updates
  chrome.runtime.onMessage.addListener(function(request) {
    if (request && request.type === 'status') {
      setRunningUI(!!request.isChecking);
    }
  });
});


