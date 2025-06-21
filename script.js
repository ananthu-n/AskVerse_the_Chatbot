// script.js
const API = 'https://askverse-the-chatbot.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const chatInput = document.getElementById('chat-input');
  const chatBox = document.getElementById('chat-box');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('login-username').value;
      const password = document.getElementById('login-password').value;

      try {
        const res = await fetch(`${API}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (data.access_token) {
          localStorage.setItem('token', data.access_token);
          window.location.href = 'chat.html';
        } else {
          alert('Login failed');
        }
      } catch (err) {
        alert('Error logging in');
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('register-username').value;
      const email = document.getElementById('register-email').value;
      const password = document.getElementById('register-password').value;
      const role = document.getElementById('register-role').value || "user";

      try {
        const res = await fetch(`${API}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password, role })
        });
        if (res.ok) {
          alert('✅ Registration successful! Login now.');
          window.location.href = 'index.html';
        } else {
          const err = await res.json();
          alert('❌ ' + (err.detail || 'Registration failed'));
        }
      } catch (err) {
        alert('Error during registration.');
      }
    });
  }

  if (chatInput && chatBox) {
    document.querySelector('button').addEventListener('click', sendChat);
    chatInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') sendChat();
    });
  }
});

async function sendChat() {
  const input = document.getElementById('chat-input');
  const prompt = input.value.trim();
  const chatBox = document.getElementById('chat-box');
  const token = localStorage.getItem('token');

  if (!prompt || !token) return;

  const userMsg = document.createElement('div');
  userMsg.className = 'chat-msg user-msg';
  userMsg.textContent = "🧑 " + prompt;
  chatBox.appendChild(userMsg);

  input.value = '';

  try {
    const res = await fetch(`${API}/chat/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt })
    });
    const data = await res.json();
    const botMsg = document.createElement('div');
    botMsg.className = 'chat-msg bot-msg';
    botMsg.textContent = "🤖 " + data.response;
    chatBox.appendChild(botMsg);
  } catch (err) {
    const errMsg = document.createElement('div');
    errMsg.className = 'chat-msg bot-msg';
    errMsg.textContent = "⚠️ Failed to get response.";
    chatBox.appendChild(errMsg);
  }

  chatBox.scrollTop = chatBox.scrollHeight;
}

function logout() {
  localStorage.removeItem('token');
  window.location.href = 'index.html';
}
