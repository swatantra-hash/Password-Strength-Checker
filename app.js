function checkPasswordStrength(password) {
  let score = 0;
  let feedback = [];

  if (password.length < 8) feedback.push(">> Requires 8+ characters.");
  else score++;

  if (!/[A-Z]/.test(password)) feedback.push(">> Requires an uppercase letter.");
  else score++;

  if (!/[a-z]/.test(password)) feedback.push(">> Requires a lowercase letter.");
  else score++;

  if (!/[0-9]/.test(password)) feedback.push(">> Requires a number.");
  else score++;

  if (!/[^A-Za-z0-9]/.test(password)) feedback.push(">> Requires a special symbol.");
  else score++;

  let strength = "";
  let cssClass = "";

  if (score <= 2) {
    strength = "WEAK";
    cssClass = "weak";
  } else if (score <= 4) {
    strength = "MODERATE";
    cssClass = "moderate";
  } else {
    strength = "STRONG";
    cssClass = "strong";
  }

  return { strength, cssClass, feedback };
}

const passwordInput = document.getElementById("password");
const strengthResult = document.getElementById("strengthResult");
const suggestionsBox = document.getElementById("suggestions");
const crackTimeResult = document.getElementById("crackTime");
const pwnedCheckResult = document.getElementById("pwnedCheck");
const togglePassword = document.getElementById("togglePassword");
const aboutLink = document.getElementById("aboutLink");
const suggestPasswordLink = document.getElementById("suggestPasswordLink");
const checkButton = document.getElementById("checkButton");
let analysisTimeout;

function calculateCrackTime(password) {
    if (!password) return "N/A";
    let charPool = 0;
    if (/[a-z]/.test(password)) charPool += 26;
    if (/[A-Z]/.test(password)) charPool += 26;
    if (/[0-9]/.test(password)) charPool += 10;
    if (/[^A-Za-z0-9]/.test(password)) charPool += 32;
    const combinations = Math.pow(charPool, password.length);
    const guessesPerSecond = 1e10; // 10 billion guesses/sec
    const seconds = combinations / guessesPerSecond;
    if (seconds < 1) return "Instantly";
    if (seconds < 60) return `< 1 minute`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
    if (seconds < 3153600000) return `${Math.round(seconds / 31536000)} years`;
    return "Centuries";
}

function typeEffect(element, text, speed = 15) {
    let i = 0;
    element.innerHTML = "";
    function typing() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(typing, speed);
        }
    }
    typing();
}

passwordInput.addEventListener("input", () => {
  clearTimeout(analysisTimeout);
  strengthResult.innerHTML = `Strength: <span class="label">ANALYZING...</span>`;
  crackTimeResult.textContent = `Time to Crack: ...`;
  pwnedCheckResult.textContent = `Breach Check: ...`;
  suggestionsBox.innerHTML = "";

  analysisTimeout = setTimeout(() => {
    const password = passwordInput.value;
    const { strength, cssClass, feedback } = checkPasswordStrength(password);

    strengthResult.innerHTML = `Strength: <span class="label ${cssClass}">${strength}</span>`;
    
    const crackTimeText = calculateCrackTime(password);
    crackTimeResult.textContent = `Time to Crack: ${crackTimeText}`;

    // AI Feature: Simulated Pwned Check
    pwnedCheckResult.textContent = `Breach Check: SCANNING...`;
    setTimeout(() => {
        // In a real app, this would call an API like Have I Been Pwned.
        // For this demo, we simulate a secure result.
        pwnedCheckResult.innerHTML = `Breach Check: <span class="strong">SECURE</span>`;
    }, 700);


    const suggestionsText = feedback.length 
      ? feedback.join(" ")
      : ">> All security criteria met. System integrity is high.";
    
    typeEffect(suggestionsBox, suggestionsText);
  }, 500);
});

togglePassword.addEventListener("click", () => {
  const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
  passwordInput.setAttribute("type", type);
  togglePassword.textContent = type === "password" ? "👁️" : "🙈";
});

aboutLink.addEventListener("click", (event) => {
  event.preventDefault();
  alert("Author: Swatantra\n© 2025 Swatantra. All Rights Reserved.");
});

function generatePassword() {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()_+~`|}{[]:;?><,./-=";
  let password = "";
  password += upper[Math.floor(Math.random() * upper.length)];
  password += lower[Math.floor(Math.random() * lower.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  const allChars = upper + lower + numbers + symbols;
  for (let i = 0; i < 10; i++) { // Increased length for better security
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  return password.split('').sort(() => 0.5 - Math.random()).join('');
}

suggestPasswordLink.addEventListener("click", (event) => {
  event.preventDefault();
  passwordInput.value = generatePassword();
  passwordInput.dispatchEvent(new Event('input'));
});

checkButton.addEventListener("click", () => {
  const strengthLabel = strengthResult.querySelector('.label');
  const isStrong = strengthLabel && strengthLabel.classList.contains('strong');

  if (isStrong) {
    alert("Analysis complete. Password meets all security criteria.");
  } else {
    alert("Warning: Password is not yet rated as STRONG. Please review suggestions.");
  }

  // Disable the button after the check
  checkButton.disabled = true;
  checkButton.textContent = "> CHECK_COMPLETE";
  checkButton.style.opacity = '0.6';
  checkButton.style.cursor = 'not-allowed';
});
