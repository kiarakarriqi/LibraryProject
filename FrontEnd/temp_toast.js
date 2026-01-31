function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <span class="toast-close" onclick="this.parentElement.remove()">&times;</span>
  `;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    if (toast.parentElement) {
      toast.remove();
    }
  }, 8000); // 8 sekonda, por mund ta mbyllësh me X
}
