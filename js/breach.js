/* ============================================
   BREACH CHECK — Have I Been Pwned (k-anonymity)
   ============================================ */

const BreachChecker = (() => {

    // SHA-1 hash using Web Crypto API
    async function sha1(message) {
        const encoder = new TextEncoder();
        const data = encoder.encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-1', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    }

    /**
     * Check a password against Have I Been Pwned using k-anonymity.
     * Only the first 5 characters of the SHA-1 hash are sent to the API.
     * The full password NEVER leaves the browser.
     *
     * @param {string} password - The password to check
     * @returns {Promise<{breached: boolean, count: number, error: string|null}>}
     */
    async function check(password) {
        if (!password) {
            return { breached: false, count: 0, error: null };
        }

        try {
            const hash = await sha1(password);
            const prefix = hash.substring(0, 5);
            const suffix = hash.substring(5);

            const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
                headers: { 'Add-Padding': 'true' }  // Pad responses to prevent size-based analysis
            });

            if (!response.ok) {
                throw new Error(`API returned ${response.status}`);
            }

            const text = await response.text();
            const lines = text.split('\r\n');

            for (const line of lines) {
                const [hashSuffix, count] = line.split(':');
                if (hashSuffix === suffix) {
                    const breachCount = parseInt(count, 10);
                    if (breachCount > 0) {
                        return { breached: true, count: breachCount, error: null };
                    }
                }
            }

            return { breached: false, count: 0, error: null };
        } catch (err) {
            console.warn('Breach check failed:', err.message);
            return { breached: false, count: 0, error: 'Unable to check — no internet or API unavailable' };
        }
    }

    /**
     * Format the breach count for display
     */
    function formatCount(count) {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
        return count.toString();
    }

    return { check, formatCount };
})();
