var API_URL = 'http://localhost:5273/api';

// LOGIN FORM
var loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    var username = document.getElementById('username').value.trim();
    var password = document.getElementById('password').value.trim();
    var errorMsg = document.getElementById('error-msg');
    errorMsg.textContent = '';
    errorMsg.classList.remove('show');
    try {
      var res = await fetch(API_URL + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password: password })
      });
      if (!res.ok) {
        errorMsg.textContent = 'Invalid username or password!';
        errorMsg.classList.add('show');
        return;
      }
      var user = await res.json();
      sessionStorage.setItem('userId', String(user.userId));
      sessionStorage.setItem('userName', user.name);
      window.location.href = 'index.html';
    } catch (err) {
      errorMsg.textContent = 'Server error. Make sure API is running!';
      errorMsg.classList.add('show');
    }
  });
}

// REGISTER FORM
var registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    var name = document.getElementById('reg-name').value.trim();
    var email = document.getElementById('reg-email').value.trim();
    var password = document.getElementById('reg-password').value.trim();
    var errorMsg = document.getElementById('error-msg');
    errorMsg.textContent = '';
    errorMsg.classList.remove('show');
    if (!name || !email || !password) {
      errorMsg.textContent = 'Please fill all fields!';
      errorMsg.classList.add('show');
      return;
    }
    try {
      var res = await fetch(API_URL + '/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, email: email, password: password })
      });
      if (!res.ok) {
        var data = await res.json();
        errorMsg.textContent = data.message || 'Registration failed!';
        errorMsg.classList.add('show');
        return;
      }
      var user = await res.json();
      sessionStorage.setItem('userId', String(user.userId));
      sessionStorage.setItem('userName', user.name);
      window.location.href = 'index.html';
    } catch (err) {
      errorMsg.textContent = 'Server error. Make sure API is running!';
      errorMsg.classList.add('show');
    }
  });
}

// CHECK AUTH
function checkAuth() {
  var userId = sessionStorage.getItem('userId');
  var page = window.location.pathname;
  if (!userId && !page.includes('login.html') && !page.includes('register.html')) {
    window.location.href = 'login.html';
  }
}

// LOGOUT
function logout() {
  sessionStorage.clear();
  window.location.href = 'login.html';
}

checkAuth();
