/* ============================================
   PASSWORD GENERATOR — Secure Random Generation
   ============================================ */

const PasswordGenerator = (() => {

    const CHAR_SETS = {
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        digits: '0123456789',
        symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?/~`'
    };

    /**
     * Generate a cryptographically random password.
     * Uses crypto.getRandomValues() for true randomness.
     *
     * @param {Object} options
     * @param {number} options.length - Password length (8–64)
     * @param {boolean} options.uppercase - Include uppercase letters
     * @param {boolean} options.lowercase - Include lowercase letters
     * @param {boolean} options.digits - Include digits
     * @param {boolean} options.symbols - Include special symbols
     * @returns {string} Generated password
     */
    function generate(options = {}) {
        const {
            length = 16,
            uppercase = true,
            lowercase = true,
            digits = true,
            symbols = true
        } = options;

        // Build the character pool
        let pool = '';
        const required = [];

        if (uppercase) {
            pool += CHAR_SETS.uppercase;
            required.push(getSecureRandom(CHAR_SETS.uppercase));
        }
        if (lowercase) {
            pool += CHAR_SETS.lowercase;
            required.push(getSecureRandom(CHAR_SETS.lowercase));
        }
        if (digits) {
            pool += CHAR_SETS.digits;
            required.push(getSecureRandom(CHAR_SETS.digits));
        }
        if (symbols) {
            pool += CHAR_SETS.symbols;
            required.push(getSecureRandom(CHAR_SETS.symbols));
        }

        // Fallback if nothing selected
        if (pool.length === 0) {
            pool = CHAR_SETS.lowercase;
            required.push(getSecureRandom(CHAR_SETS.lowercase));
        }

        // Fill remaining length
        const remaining = Math.max(0, length - required.length);
        const chars = [...required];

        for (let i = 0; i < remaining; i++) {
            chars.push(getSecureRandom(pool));
        }

        // Shuffle using Fisher-Yates with crypto randomness
        for (let i = chars.length - 1; i > 0; i--) {
            const j = secureRandomInt(i + 1);
            [chars[i], chars[j]] = [chars[j], chars[i]];
        }

        return chars.join('');
    }

    /**
     * Get a cryptographically random character from a string
     */
    function getSecureRandom(str) {
        return str[secureRandomInt(str.length)];
    }

    /**
     * Generate a cryptographically secure random integer [0, max)
     */
    function secureRandomInt(max) {
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);
        return array[0] % max;
    }

    /**
     * Calculate the entropy of a generated password given its options
     */
    function calculatePoolSize(options) {
        let pool = 0;
        if (options.uppercase) pool += 26;
        if (options.lowercase) pool += 26;
        if (options.digits) pool += 10;
        if (options.symbols) pool += 29;
        return pool || 26;
    }

    return { generate, calculatePoolSize };
})();
