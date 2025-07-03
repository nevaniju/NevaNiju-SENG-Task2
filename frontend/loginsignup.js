const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');

registerBtn.addEventListener('click', () => container.classList.add('active'));
loginBtn.addEventListener('click', () => container.classList.remove('active'));

// Password rules check
const passwordInput = document.querySelector('.form-box.register input[name="password"]');
const registerForm = document.querySelector('#register-form');
const registerError = document.getElementById('register-error');

passwordInput.addEventListener('input', () => {
  const value = passwordInput.value;
  document.getElementById('length').classList.toggle('valid', value.length >= 12);
  document.getElementById('uppercase').classList.toggle('valid', /[A-Z]/.test(value));
  document.getElementById('number').classList.toggle('valid', /\d/.test(value));
  document.getElementById('special').classList.toggle('valid', /[!@#$%^&*]/.test(value));
});

registerForm.addEventListener('submit', async (e) => {
  const rules = document.querySelectorAll('.password-rules p');
  for (const rule of rules) {
    if (!rule.classList.contains('valid')) {
      e.preventDefault();
      registerError.textContent = 'Password does not meet the criteria.';
      return;
    }
  }

  e.preventDefault();
  const formData = new FormData(registerForm);
  const data = Object.fromEntries(formData.entries());
  const res = await fetch('/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const text = await res.text();
  if (text.includes('❌')) {
    registerError.textContent = 'Username or email already in use. Please select a different one.';
  } else {
    document.write(text);
  }
});

// Login form
const loginForm = document.querySelector('#login-form');
const loginError = document.getElementById('login-error');
const lockoutCountdown = document.getElementById('lockout-countdown');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(loginForm);
  const data = Object.fromEntries(formData.entries());
  const res = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const text = await res.text();
  if (text.includes('❌ User not found')) {
    loginError.textContent = 'No account registered with that username. Please try again.';
  } else if (text.includes('❌ Locked out')) {
    const remaining = text.match(/\d+/)[0];
    startLockoutCountdown(remaining);
    loginError.textContent = '';
  } else if (text.includes('❌ Incorrect password')) {
    loginError.textContent = 'Password incorrect. Please try again.';
  } else {
    document.write(text);
  }
});

function startLockoutCountdown(seconds) {
  let remaining = parseInt(seconds);
  lockoutCountdown.textContent = `Locked out. Try again in ${remaining}s`;
  const interval = setInterval(() => {
    remaining--;
    if (remaining <= 0) {
      clearInterval(interval);
      lockoutCountdown.textContent = '';
    } else {
      lockoutCountdown.textContent = `Locked out. Try again in ${remaining}s`;
    }
  }, 1000);
}
