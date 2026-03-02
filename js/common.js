/* ============================================
   COMMON — Shared Nav, Footer, Theme, Particles
   ============================================ */

const Common = (() => {

    // ── Navigation ──
    function injectNav(activePage) {
        const nav = document.createElement('nav');
        nav.className = 'nav';
        nav.setAttribute('role', 'navigation');
        nav.setAttribute('aria-label', 'Main navigation');
        nav.innerHTML = `
      <div class="nav-inner">
        <a href="index.html" class="nav-logo" aria-label="PassGuard Home">
          <span class="logo-icon">🛡️</span>
          <span>PassGuard</span>
        </a>
        <button class="nav-mobile-toggle" aria-label="Toggle menu" aria-expanded="false">☰</button>
        <div class="nav-links" role="menubar">
          <a href="index.html" role="menuitem" class="${activePage === 'home' ? 'active' : ''}">Home</a>
          <a href="analyzer.html" role="menuitem" class="${activePage === 'analyzer' ? 'active' : ''}">Analyzer</a>
          <a href="about.html" role="menuitem" class="${activePage === 'about' ? 'active' : ''}">About</a>
          <button class="theme-toggle" aria-label="Toggle dark/light theme" id="themeToggle">🌙</button>
        </div>
      </div>
    `;
        document.body.prepend(nav);

        // Mobile toggle
        const toggleBtn = nav.querySelector('.nav-mobile-toggle');
        const links = nav.querySelector('.nav-links');
        toggleBtn.addEventListener('click', () => {
            const isOpen = links.classList.toggle('open');
            toggleBtn.setAttribute('aria-expanded', isOpen);
            toggleBtn.textContent = isOpen ? '✕' : '☰';
        });

        // Scroll effect
        window.addEventListener('scroll', () => {
            nav.classList.toggle('scrolled', window.scrollY > 20);
        }, { passive: true });

        // Theme toggle
        initTheme();
    }

    // ── Footer ──
    function injectFooter() {
        const footer = document.createElement('footer');
        footer.className = 'footer';
        footer.setAttribute('role', 'contentinfo');
        footer.innerHTML = `
      <div class="footer-inner">
        <div class="footer-brand">
          <a href="index.html" class="nav-logo">
            <span class="logo-icon">🛡️</span>
            <span>PassGuard</span>
          </a>
          <p>A professional password security analysis engine. All analysis runs locally in your browser — your passwords never leave your device.</p>
        </div>
        <div class="footer-col">
          <h4>Navigate</h4>
          <a href="index.html">Home</a>
          <a href="analyzer.html">Analyzer</a>
          <a href="about.html">About</a>
        </div>
        <div class="footer-col">
          <h4>Legal</h4>
          <a href="privacy.html">Privacy Policy</a>
          <a href="terms.html">Terms of Service</a>
          <a href="mailto:unfazedswatantra@yahoo.com">Contact</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>&copy; ${new Date().getFullYear()} Swatantra. All Rights Reserved.</span>
        <span>Built with security in mind.</span>
      </div>
    `;
        document.body.querySelector('.page').appendChild(footer);
    }

    // ── Theme ──
    function initTheme() {
        const saved = localStorage.getItem('passguard-theme') || 'dark';
        document.documentElement.setAttribute('data-theme', saved);
        updateThemeIcon(saved);

        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            toggle.addEventListener('click', () => {
                const current = document.documentElement.getAttribute('data-theme');
                const next = current === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', next);
                localStorage.setItem('passguard-theme', next);
                updateThemeIcon(next);
            });
        }
    }

    function updateThemeIcon(theme) {
        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            toggle.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    }

    // ── Particle Background ──
    function initParticles() {
        const canvas = document.createElement('canvas');
        canvas.id = 'particles-canvas';
        document.body.prepend(canvas);

        const ctx = canvas.getContext('2d');
        let particles = [];
        let animId;

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        function createParticles() {
            particles = [];
            const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.4,
                    vy: (Math.random() - 0.5) * 0.4,
                    radius: Math.random() * 1.5 + 0.5,
                    opacity: Math.random() * 0.4 + 0.1
                });
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
            const particleColor = isDark ? '99, 102, 241' : '79, 70, 229';
            const lineColor = isDark ? '99, 102, 241' : '79, 70, 229';

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${particleColor}, ${p.opacity})`;
                ctx.fill();

                // Connect nearby particles
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(${lineColor}, ${0.06 * (1 - dist / 120)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }

            animId = requestAnimationFrame(animate);
        }

        resize();
        createParticles();
        animate();

        window.addEventListener('resize', () => {
            resize();
            createParticles();
        });
    }

    // ── Initialize page ──
    function init(activePage) {
        injectNav(activePage);
        injectFooter();
        initParticles();

        // Reveal animations on scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }

    return { init };
})();
