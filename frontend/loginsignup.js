const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');

registerBtn.addEventListener('click', () => {
  container.classList.add('active');
});

loginBtn.addEventListener('click', () => {
  container.classList.remove('active');
});

// Password rules check for registration only
const passwordInput = document.querySelector('.form-box.register input[name="password"]');
const registerForm = document.querySelector('.form-box.register form');

passwordInput.addEventListener('input', () => {
  const value = passwordInput.value;
  document.getElementById('length').classList.toggle('valid', value.length >= 12);
  document.getElementById('uppercase').classList.toggle('valid', /[A-Z]/.test(value));
  document.getElementById('number').classList.toggle('valid', /\d/.test(value));
  document.getElementById('special').classList.toggle('valid', /[!@#$%^&*]/.test(value));
});

registerForm.addEventListener('submit', (e) => {
  const rules = document.querySelectorAll('.password-rules p');
  for (const rule of rules) {
    if (!rule.classList.contains('valid')) {
      e.preventDefault();
      alert('Password does not meet the criteria.');
      return;
    }
  }
});
