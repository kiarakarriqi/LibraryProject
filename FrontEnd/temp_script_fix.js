Në script.js, gjej showToast function dhe zëvendësoje me:

function showToast(message, type = 'success') {
  // Fshi toast-in e vjetër nëse ekziston
  const oldToast = document.querySelector('.toast');
  if (oldToast) {
    oldToast.remove();
  }
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <span class="toast-close" onclick="this.parentElement.remove()">&times;</span>
  `;
  document.body.appendChild(toast);
}
