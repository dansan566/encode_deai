document.addEventListener('DOMContentLoaded', () => {
    const appDiv = document.getElementById('app');
    if (appDiv) {
      appDiv.textContent = 'This is running in the renderer process!';
    }
  });