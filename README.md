# 🛡️ PassGuard — Password Strength Analysis Engine

A professional-grade, client-side password security analysis tool built with vanilla HTML, CSS, and JavaScript. All analysis runs entirely in your browser — **your passwords never leave your device**.

![PassGuard Screenshot](https://img.shields.io/badge/Status-Live-22c55e?style=for-the-badge) ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

---

## ✨ Features

### 🧮 Entropy-Based Scoring
Calculates true information-theoretic entropy in bits using `log₂(pool_size ^ length)`. Higher entropy = exponentially harder to crack.

### 🔍 Pattern Detection
Identifies common weaknesses:
- Keyboard walks (`qwerty`, `asdf`, `zxcvbn`)
- Sequential characters (`abc`, `123`)
- Repeated characters (`aaa`, `111`)
- Top 200 most common passwords

### 🌐 Real Breach Detection
Checks passwords against **600M+ compromised passwords** via the [Have I Been Pwned](https://haveibeenpwned.com) API using **k-anonymity** — only the first 5 characters of the SHA-1 hash are sent. Your full password is never transmitted.

### ⏱️ Multi-Tier Crack Time Estimation
Estimates time-to-crack at three threat levels:
- **Online attack** (1K guesses/sec)
- **GPU cluster** (10B guesses/sec)
- **Quantum computer** (1Q guesses/sec)

### 🎲 Crypto-Secure Password Generator
Generates passwords using `crypto.getRandomValues()` with configurable:
- Length (8–64 characters)
- Character types (uppercase, lowercase, digits, symbols)
- One-click copy and "use in analyzer"

### 🔐 Zero Trust Privacy
- All processing runs client-side in your browser
- No cookies, no analytics, no tracking
- No server, no database, no backend
- Only `localStorage` is used (for theme preference)

---

## 📂 Project Structure

```
├── index.html          ← Landing page
├── analyzer.html       ← Main analysis tool
├── about.html          ← About project & author
├── privacy.html        ← Privacy Policy
├── terms.html          ← Terms of Service
├── css/
│   ├── variables.css   ← Design tokens (colors, fonts, spacing)
│   ├── base.css        ← Reset, typography, scrollbar
│   ├── components.css  ← Cards, buttons, gauges, toggles
│   ├── layouts.css     ← Grid system + responsive breakpoints
│   └── animations.css  ← Keyframes + micro-interactions
├── js/
│   ├── analyzer.js     ← Core scoring engine
│   ├── breach.js       ← HIBP API integration
│   ├── generator.js    ← Secure password generator
│   ├── common.js       ← Shared nav, footer, theme, particles
│   └── ui.js           ← Analyzer page controller
└── assets/
    └── profile.jpg     ← Author photo
```

---

## 🚀 Getting Started

No dependencies, no build step, no framework. Just open in a browser:

```bash
# Clone the repository
git clone https://github.com/swatantra-hash/Password-Strength-Checker.git

# Open in browser
start index.html        # Windows
open index.html         # macOS
xdg-open index.html     # Linux
```

Or use a local server:
```bash
npx serve .
```

---

## 🎯 Scoring Formula

```
base_score  = entropy_points (max 50)
            + criteria_points (max 30)
            + length_bonus (max 20)

penalties   = common_password (-60)
            + keyboard_pattern (-15)
            + repeated_chars (-10)
            + sequential_chars (-10)

final_score = clamp(base_score - penalties, 0, 100)
```

| Score  | Rating      |
|--------|-------------|
| 0–20   | Very Weak   |
| 21–40  | Weak        |
| 41–60  | Fair        |
| 61–80  | Strong      |
| 81–100 | Very Strong |

---

## 🛠️ Tech Stack

| Technology | Usage |
|---|---|
| HTML5 | Semantic structure, SEO, accessibility |
| CSS3 | Custom properties, glassmorphism, animations, responsive grid |
| JavaScript (ES6+) | Modular architecture, Web Crypto API, Fetch API |
| Google Fonts | Inter (headings), JetBrains Mono (code/data) |
| HIBP API | Breach detection via k-anonymity |

---

## 📜 Legal

- [Privacy Policy](privacy.html) — No data collected, full client-side processing
- [Terms of Service](terms.html) — Educational tool, no warranty

---

## 👤 Author

**Swatantra**
- 📧 [unfazedswatantra@yahoo.com](mailto:unfazedswatantra@yahoo.com)

---

## 📄 License

© 2026 Swatantra. All Rights Reserved.

---

*Last updated: March 3, 2026*
