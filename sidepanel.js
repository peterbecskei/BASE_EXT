
document.addEventListener('DOMContentLoaded', function() {
  const menu = document.getElementById('menu');
  const featureView = document.getElementById('featureView');
  const featureTitle = document.getElementById('featureTitle');
  const notifier = document.getElementById('notifier');
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const backBtn = document.getElementById('backBtn');
  const statusBadge = document.getElementById('statusBadge');

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


