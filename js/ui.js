/* ============================================
   UI CONTROLLER — Analyzer Page Interactions
   ============================================ */

const AnalyzerUI = (() => {
    let elements = {};
    let debounceTimer = null;
    let currentBreachAbort = null;

    function init() {
        cacheElements();
        bindEvents();
        initGenerator();
        updateCharCount(0);
    }

    function cacheElements() {
        elements = {
            passwordInput: document.getElementById('passwordInput'),
            toggleVisibility: document.getElementById('toggleVisibility'),
            charCount: document.getElementById('charCount'),
            // Gauge
            gaugeFill: document.getElementById('gaugeFill'),
            gaugeScore: document.getElementById('gaugeScore'),
            gaugeLabel: document.getElementById('gaugeLabel'),
            strengthBarFill: document.getElementById('strengthBarFill'),
            // Stats
            entropyValue: document.getElementById('entropyValue'),
            crackTimeValue: document.getElementById('crackTimeValue'),
            crackTimeOffline: document.getElementById('crackTimeOffline'),
            // Criteria
            criteriaList: document.getElementById('criteriaList'),
            // Composition
            compUppercase: document.getElementById('compUppercase'),
            compLowercase: document.getElementById('compLowercase'),
            compDigits: document.getElementById('compDigits'),
            compSymbols: document.getElementById('compSymbols'),
            // Warnings
            warningsList: document.getElementById('warningsList'),
            // Breach
            breachResult: document.getElementById('breachResult'),
            breachBtn: document.getElementById('breachCheckBtn'),
            // Generator
            genOutput: document.getElementById('genOutput'),
            genLength: document.getElementById('genLength'),
            genLengthValue: document.getElementById('genLengthValue'),
            genUppercase: document.getElementById('genUppercase'),
            genLowercase: document.getElementById('genLowercase'),
            genDigits: document.getElementById('genDigits'),
            genSymbols: document.getElementById('genSymbols'),
            genBtn: document.getElementById('genBtn'),
            genCopyBtn: document.getElementById('genCopyBtn'),
            genUseBtn: document.getElementById('genUseBtn')
        };
    }

    function bindEvents() {
        // Password input — real-time analysis with debounce
        elements.passwordInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            const password = elements.passwordInput.value;
            updateCharCount(password.length);

            if (!password) {
                resetUI();
                return;
            }

            debounceTimer = setTimeout(() => {
                const result = PasswordAnalyzer.analyze(password);
                renderAnalysis(result);
            }, 150);
        });

        // Toggle password visibility
        elements.toggleVisibility.addEventListener('click', () => {
            const isPassword = elements.passwordInput.type === 'password';
            elements.passwordInput.type = isPassword ? 'text' : 'password';
            elements.toggleVisibility.textContent = isPassword ? '🙈' : '👁️';
            elements.toggleVisibility.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
        });

        // Breach check button
        elements.breachBtn.addEventListener('click', async () => {
            const password = elements.passwordInput.value;
            if (!password) return;
            await runBreachCheck(password);
        });
    }

    // ── Render Analysis Results ──
    function renderAnalysis(result) {
        // Gauge
        animateGauge(result.score, result.strength);

        // Strength bar
        elements.strengthBarFill.style.width = `${result.score}%`;
        elements.strengthBarFill.style.background = getGradientForScore(result.score);

        // Stats
        elements.entropyValue.textContent = `${result.entropy} bits`;
        elements.crackTimeValue.textContent = result.crackTime.online;
        elements.crackTimeOffline.textContent = result.crackTime.offline;

        // Criteria checklist
        renderCriteria(result.criteria);

        // Composition
        renderComposition(result.composition);

        // Warnings
        renderWarnings(result.warnings);
    }

    function animateGauge(score, strength) {
        const circumference = 2 * Math.PI * 70; // radius = 70
        const offset = circumference - (score / 100) * circumference;
        elements.gaugeFill.style.strokeDasharray = circumference;
        elements.gaugeFill.style.strokeDashoffset = offset;
        elements.gaugeFill.style.stroke = strength.color;

        elements.gaugeScore.textContent = score;
        elements.gaugeScore.style.color = strength.color;
        elements.gaugeLabel.textContent = strength.label;
        elements.gaugeLabel.style.color = strength.color;
    }

    function renderCriteria(criteria) {
        elements.criteriaList.innerHTML = criteria.map(c => `
      <div class="criteria-item ${c.met ? 'met' : 'unmet'}">
        <span class="criteria-icon">${c.met ? '✓' : ''}</span>
        <span>${c.label}</span>
      </div>
    `).join('');
    }

    function renderComposition(comp) {
        animateBar(elements.compUppercase, comp.uppercase.percent, '#818cf8');
        animateBar(elements.compLowercase, comp.lowercase.percent, '#06b6d4');
        animateBar(elements.compDigits, comp.digits.percent, '#f59e0b');
        animateBar(elements.compSymbols, comp.symbols.percent, '#22c55e');
    }

    function animateBar(container, percent, color) {
        const bar = container.querySelector('.comp-bar-fill');
        const label = container.querySelector('.comp-percent');
        bar.style.width = `${percent}%`;
        bar.style.background = color;
        label.textContent = `${percent}%`;
    }

    function renderWarnings(warnings) {
        if (warnings.length === 0) {
            elements.warningsList.innerHTML = `
        <div class="breach-result safe">
          <span>✅</span>
          <span>No security concerns detected</span>
        </div>`;
            return;
        }

        elements.warningsList.innerHTML = warnings.map(w => {
            const icon = w.severity === 'critical' ? '🚨' : w.severity === 'warning' ? '⚠️' : 'ℹ️';
            const cls = w.severity === 'critical' ? 'compromised' : w.severity === 'warning' ? 'checking' : 'safe';
            return `<div class="breach-result ${cls}"><span>${icon}</span><span>${w.message}</span></div>`;
        }).join('');
    }

    // ── Breach Check ──
    async function runBreachCheck(password) {
        elements.breachResult.innerHTML = `
      <div class="breach-result checking">
        <span class="spinner"></span>
        <span>Checking against known data breaches...</span>
      </div>`;

        const result = await BreachChecker.check(password);

        if (result.error) {
            elements.breachResult.innerHTML = `
        <div class="breach-result checking">
          <span>⚠️</span>
          <span>${result.error}</span>
        </div>`;
        } else if (result.breached) {
            elements.breachResult.innerHTML = `
        <div class="breach-result compromised shield-pulse">
          <span>🚨</span>
          <span>Found in <strong>${BreachChecker.formatCount(result.count)}</strong> data breaches! Do NOT use this password.</span>
        </div>`;
        } else {
            elements.breachResult.innerHTML = `
        <div class="breach-result safe shield-pulse">
          <span>🛡️</span>
          <span>Not found in any known data breaches. Good!</span>
        </div>`;
        }
    }

    // ── Password Generator ──
    function initGenerator() {
        // Slider
        elements.genLength.addEventListener('input', () => {
            elements.genLengthValue.textContent = elements.genLength.value;
        });

        // Generate button
        elements.genBtn.addEventListener('click', generatePassword);

        // Copy button
        elements.genCopyBtn.addEventListener('click', () => {
            const text = elements.genOutput.querySelector('.gen-text').textContent;
            if (!text || text === 'Click "Generate" to create a password') return;
            navigator.clipboard.writeText(text).then(() => {
                showCopiedFeedback(elements.genCopyBtn);
            });
        });

        // Use in analyzer button
        elements.genUseBtn.addEventListener('click', () => {
            const text = elements.genOutput.querySelector('.gen-text').textContent;
            if (!text || text === 'Click "Generate" to create a password') return;
            elements.passwordInput.value = text;
            elements.passwordInput.dispatchEvent(new Event('input'));
        });

        // Generate initial password
        generatePassword();
    }

    function generatePassword() {
        const options = {
            length: parseInt(elements.genLength.value),
            uppercase: elements.genUppercase.checked,
            lowercase: elements.genLowercase.checked,
            digits: elements.genDigits.checked,
            symbols: elements.genSymbols.checked
        };

        const password = PasswordGenerator.generate(options);
        elements.genOutput.querySelector('.gen-text').textContent = password;
    }

    function showCopiedFeedback(btn) {
        const feedback = document.createElement('span');
        feedback.className = 'copied-feedback';
        feedback.textContent = 'Copied!';
        btn.style.position = 'relative';
        btn.appendChild(feedback);
        setTimeout(() => feedback.remove(), 1000);
    }

    // ── Utilities ──
    function updateCharCount(count) {
        elements.charCount.textContent = `${count} characters`;
        elements.charCount.style.color = count === 0 ? 'var(--color-text-muted)' :
            count < 8 ? 'var(--color-danger)' :
                count < 12 ? 'var(--color-warning)' : 'var(--color-success)';
    }

    function getGradientForScore(score) {
        if (score <= 20) return 'linear-gradient(90deg, #ef4444, #f87171)';
        if (score <= 40) return 'linear-gradient(90deg, #f97316, #fb923c)';
        if (score <= 60) return 'linear-gradient(90deg, #f59e0b, #fbbf24)';
        if (score <= 80) return 'linear-gradient(90deg, #22c55e, #4ade80)';
        return 'linear-gradient(90deg, #06b6d4, #6366f1)';
    }

    function resetUI() {
        animateGauge(0, { color: 'var(--color-text-muted)', label: 'Enter a password' });
        elements.strengthBarFill.style.width = '0%';
        elements.entropyValue.textContent = '0 bits';
        elements.crackTimeValue.textContent = '—';
        elements.crackTimeOffline.textContent = '—';
        elements.criteriaList.innerHTML = '';
        elements.warningsList.innerHTML = '';
        elements.breachResult.innerHTML = '';
        updateCharCount(0);
        ['compUppercase', 'compLowercase', 'compDigits', 'compSymbols'].forEach(key => {
            const el = elements[key];
            el.querySelector('.comp-bar-fill').style.width = '0%';
            el.querySelector('.comp-percent').textContent = '0%';
        });
    }

    return { init };
})();
