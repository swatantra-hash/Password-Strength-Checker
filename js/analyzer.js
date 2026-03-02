/* ============================================
   ANALYZER ENGINE — Core Password Analysis
   ============================================ */

const PasswordAnalyzer = (() => {

  // Top 200 common passwords (subset for client-side check)
  const COMMON_PASSWORDS = new Set([
    'password', '123456', '12345678', 'qwerty', 'abc123', 'monkey', '1234567',
    'letmein', 'trustno1', 'dragon', 'baseball', 'iloveyou', 'master', 'sunshine',
    'ashley', 'michael', 'shadow', '123123', '654321', 'superman', 'qazwsx',
    'michael', 'football', 'password1', 'password123', 'batman', 'access',
    'hello', 'charlie', 'donald', '666666', 'jordan', 'mustang', 'robert',
    'harley', 'daniel', 'david', 'thomas', 'hunter', 'jennifer', 'joshua',
    'jessica', 'pepper', 'zxcvbn', 'andrew', 'starwars', 'admin', 'passw0rd',
    'pass1234', 'welcome', 'login', 'princess', 'qwerty123', 'solo', 'passpass',
    '121212', 'flower', 'hottie', 'loveme', 'zaq1zaq1', 'ncc1701', 'welcome1',
    'aa123456', 'pass123', '111111', '1234', '12345', '1234567890', '0',
    '1q2w3e4r', '1qaz2wsx', 'qwer1234', 'password2', 'password3',
    'iloveu', 'abcdef', 'whatever', 'nicole', 'summer', 'la jolla',
    'biteme', 'maveric', 'ginger', 'bailey', 'abcabc', 'computer',
    'amanda', 'cookie', 'lakers', 'michelle', 'jessica1', 'diamond'
  ]);

  // Keyboard sequences to detect
  const KEYBOARD_PATTERNS = [
    'qwerty', 'qwertz', 'azerty', 'qweasd', 'asdfgh', 'zxcvbn',
    'poiuyt', 'lkjhgf', 'mnbvcx', '1234567890', '0987654321',
    '!@#$%^&*()', 'qazwsx', 'wsxedc', 'edcrfv', 'rfvtgb'
  ];

  // Repeated character detection
  function hasRepeatedChars(password, threshold = 3) {
    const regex = new RegExp(`(.)\\1{${threshold - 1},}`);
    return regex.test(password);
  }

  // Sequential character detection (abc, 123, etc.)
  function hasSequentialChars(password, threshold = 3) {
    let ascending = 1;
    let descending = 1;
    for (let i = 1; i < password.length; i++) {
      const diff = password.charCodeAt(i) - password.charCodeAt(i - 1);
      if (diff === 1) {
        ascending++;
        if (ascending >= threshold) return true;
      } else {
        ascending = 1;
      }
      if (diff === -1) {
        descending++;
        if (descending >= threshold) return true;
      } else {
        descending = 1;
      }
    }
    return false;
  }

  // Keyboard pattern detection
  function hasKeyboardPattern(password) {
    const lower = password.toLowerCase();
    for (const pattern of KEYBOARD_PATTERNS) {
      for (let len = 4; len <= pattern.length; len++) {
        for (let start = 0; start <= pattern.length - len; start++) {
          const sub = pattern.substring(start, start + len);
          if (lower.includes(sub)) return true;
        }
      }
    }
    return false;
  }

  // Character pool size
  function getCharPool(password) {
    let pool = 0;
    if (/[a-z]/.test(password)) pool += 26;
    if (/[A-Z]/.test(password)) pool += 26;
    if (/[0-9]/.test(password)) pool += 10;
    if (/[^A-Za-z0-9]/.test(password)) pool += 33;
    return pool;
  }

  // Entropy in bits
  function calculateEntropy(password) {
    const pool = getCharPool(password);
    if (pool === 0 || password.length === 0) return 0;
    return Math.round(password.length * Math.log2(pool));
  }

  // Character composition breakdown
  function getComposition(password) {
    const total = password.length || 1;
    const upper = (password.match(/[A-Z]/g) || []).length;
    const lower = (password.match(/[a-z]/g) || []).length;
    const digits = (password.match(/[0-9]/g) || []).length;
    const symbols = (password.match(/[^A-Za-z0-9]/g) || []).length;
    return {
      uppercase: { count: upper, percent: Math.round((upper / total) * 100) },
      lowercase: { count: lower, percent: Math.round((lower / total) * 100) },
      digits: { count: digits, percent: Math.round((digits / total) * 100) },
      symbols: { count: symbols, percent: Math.round((symbols / total) * 100) }
    };
  }

  // Crack time estimation
  function estimateCrackTime(password) {
    const pool = getCharPool(password);
    if (pool === 0 || password.length === 0) return { online: 'Instant', offline: 'Instant', quantum: 'Instant' };

    const combinations = Math.pow(pool, password.length);
    const onlineRate = 1e3;     // 1K guesses/sec (rate-limited online)
    const offlineRate = 1e10;   // 10B guesses/sec (GPU cluster)
    const quantumRate = 1e15;   // 1Q guesses/sec (hypothetical quantum)

    return {
      online: formatTime(combinations / (2 * onlineRate)),
      offline: formatTime(combinations / (2 * offlineRate)),
      quantum: formatTime(combinations / (2 * quantumRate))
    };
  }

  function formatTime(seconds) {
    if (!isFinite(seconds) || seconds <= 0) return 'Instant';
    if (seconds < 1) return 'Instant';
    if (seconds < 60) return `${Math.ceil(seconds)} seconds`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 2592000) return `${Math.round(seconds / 86400)} days`;
    if (seconds < 31536000) return `${Math.round(seconds / 2592000)} months`;
    if (seconds < 3153600000) {
      const years = Math.round(seconds / 31536000);
      return `${years.toLocaleString()} years`;
    }
    if (seconds < 3.15e13) {
      return `${Math.round(seconds / 3153600000).toLocaleString()} centuries`;
    }
    return 'Millennia+';
  }

  // Individual criteria checks
  function getCriteria(password) {
    return [
      { id: 'length', label: 'At least 8 characters', met: password.length >= 8 },
      { id: 'length12', label: 'At least 12 characters (recommended)', met: password.length >= 12 },
      { id: 'uppercase', label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
      { id: 'lowercase', label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
      { id: 'digit', label: 'Contains a number', met: /[0-9]/.test(password) },
      { id: 'symbol', label: 'Contains a special symbol', met: /[^A-Za-z0-9]/.test(password) },
      { id: 'noRepeat', label: 'No repeated characters (3+)', met: !hasRepeatedChars(password) },
      { id: 'noSequence', label: 'No sequential characters', met: !hasSequentialChars(password) },
      { id: 'noKeyboard', label: 'No keyboard patterns', met: !hasKeyboardPattern(password) },
      { id: 'notCommon', label: 'Not a common password', met: !COMMON_PASSWORDS.has(password.toLowerCase()) }
    ];
  }

  // Detected patterns / warnings
  function getWarnings(password) {
    const warnings = [];
    if (COMMON_PASSWORDS.has(password.toLowerCase())) {
      warnings.push({ severity: 'critical', message: 'This is one of the most commonly used passwords' });
    }
    if (hasRepeatedChars(password)) {
      warnings.push({ severity: 'warning', message: 'Contains repeated characters (e.g., "aaa")' });
    }
    if (hasSequentialChars(password)) {
      warnings.push({ severity: 'warning', message: 'Contains sequential characters (e.g., "abc", "123")' });
    }
    if (hasKeyboardPattern(password)) {
      warnings.push({ severity: 'warning', message: 'Contains a keyboard walk pattern (e.g., "qwerty")' });
    }
    if (password.length < 8) {
      warnings.push({ severity: 'critical', message: 'Password is too short — use at least 8 characters' });
    }
    if (password.length >= 8 && password.length < 12) {
      warnings.push({ severity: 'info', message: '12+ characters significantly increases security' });
    }
    return warnings;
  }

  // Overall score 0–100
  function calculateScore(password) {
    if (!password) return 0;

    const entropy = calculateEntropy(password);
    const criteria = getCriteria(password);
    const metCount = criteria.filter(c => c.met).length;

    // Base score from entropy (max 50 points)
    let entropyScore = Math.min(50, (entropy / 80) * 50);

    // Criteria score (max 30 points)
    let criteriaScore = (metCount / criteria.length) * 30;

    // Length bonus (max 20 points)
    let lengthScore = Math.min(20, (password.length / 20) * 20);

    // Penalties
    let penalty = 0;
    if (COMMON_PASSWORDS.has(password.toLowerCase())) penalty += 60;
    if (hasRepeatedChars(password)) penalty += 10;
    if (hasSequentialChars(password)) penalty += 10;
    if (hasKeyboardPattern(password)) penalty += 15;

    const raw = entropyScore + criteriaScore + lengthScore - penalty;
    return Math.max(0, Math.min(100, Math.round(raw)));
  }

  // Strength label from score
  function getStrengthLabel(score) {
    if (score <= 20) return { label: 'Very Weak', color: '#ef4444', class: 'danger' };
    if (score <= 40) return { label: 'Weak', color: '#f97316', class: 'danger' };
    if (score <= 60) return { label: 'Fair', color: '#f59e0b', class: 'warning' };
    if (score <= 80) return { label: 'Strong', color: '#22c55e', class: 'success' };
    return { label: 'Very Strong', color: '#06b6d4', class: 'success' };
  }

  // Full analysis
  function analyze(password) {
    const score = calculateScore(password);
    const strength = getStrengthLabel(score);
    const entropy = calculateEntropy(password);
    const crackTime = estimateCrackTime(password);
    const criteria = getCriteria(password);
    const composition = getComposition(password);
    const warnings = getWarnings(password);

    return {
      score,
      strength,
      entropy,
      crackTime,
      criteria,
      composition,
      warnings,
      length: password.length
    };
  }

  return { analyze, calculateScore, getStrengthLabel, calculateEntropy, estimateCrackTime, getCriteria, getComposition, getWarnings };
})();
