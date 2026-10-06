(function () {
  'use strict';
  let installPrompt = null;
  const button = document.getElementById('btn-install-app');
  const dialog = document.getElementById('install-app-dialog');
  const standalone = () => navigator.standalone === true ||
    !!window.matchMedia?.('(display-mode: standalone)').matches;
  const updateButton = () => { button.hidden = standalone(); };

  function showInstructions() {
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const steps = isIOS
      ? ['Open ScoreSheets in Safari.', 'Tap Share (or More, then Share), then Add to Home Screen.', 'Keep Open as Web App enabled if shown, then tap Add.']
      : /Android/.test(navigator.userAgent)
        ? ['Open ScoreSheets in Chrome.', 'Open the browser menu and choose Install app or Add to Home screen.', 'Confirm to add ScoreSheets to your home screen.']
        : ['In Chrome or Edge, use the install icon in the address bar or the browser menu’s Install app option.', 'In Safari on Mac, choose File → Add to Dock.'];
    document.getElementById('install-app-steps').innerHTML = steps.map(step => '<li>' + step + '</li>').join('');
    dialog.showModal();
  }

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installPrompt = event;
    updateButton();
  });
  window.addEventListener('appinstalled', () => {
    installPrompt = null;
    button.hidden = true;
    if (dialog.open) dialog.close();
  });
  window.matchMedia?.('(display-mode: standalone)').addEventListener?.('change', updateButton);
  button.addEventListener('click', async () => {
    if (!installPrompt) {
      showInstructions();
      return;
    }
    const prompt = installPrompt;
    installPrompt = null;
    button.disabled = true;
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice.outcome === 'accepted') button.hidden = true;
    } catch (err) {
      showInstructions();
    } finally {
      button.disabled = false;
    }
  });
  updateButton();
})();
