let token = "";

// Login function to authenticate user and get JWT token
async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("Please enter both username and password.");
    return;
  }

  try {
    const response = await fetch("https://askverse-the-chatbot.onrender.com/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    const data = await response.json();
    token = data.access_token;
    alert("✅ Login successful! You can now chat with the bot.");
  } catch (error) {
    alert("❌ Login error: " + error.message);
  }
}

// Function to send a message to the chatbot
async function sendMessage() {
  const userInput = document.getElementById("userInput");
  const message = userInput.value.trim();

  if (!message) return;
  if (!token) {
    alert("⚠️ Please log in before sending a message.");
    return;
  }

  // Display user's message
  addMessage("🧑 " + message, "user");
  userInput.value = "";

  try {
    const response = await fetch("https://askverse-the-chatbot.onrender.com/chat/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ prompt: message })
    });

    if (!response.ok) {
      throw new Error("Failed to get response from bot.");
    }

    const data = await response.json();
    addMessage("🤖 " + data.response, "bot");
  } catch (error) {
    addMessage("⚠️ Bot error: " + error.message, "bot");
  }
}

// Function to add message bubbles to chat
function addMessage(text, type) {
  const chatBox = document.getElementById("chatBox");
  const messageElement = document.createElement("div");
  messageElement.className = `chat-msg ${type}`;
  messageElement.textContent = text;
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
}
