<template>
  <footer class="fracture-footer relative overflow-hidden">
    <!-- Scanlines -->
    <div class="footer-scanlines"></div>

    <!-- Grid Background -->
    <div class="footer-grid"></div>

    <!-- Main Container -->
    <div class="footer-container">
      <!-- System Status Bar -->
      <div class="system-status">
        <div class="status-item">
          <div class="status-dot status-online"></div>
          <span class="status-label">SYSTEM:ONLINE</span>
        </div>
        <div class="status-item">
          <div class="status-dot status-ready"></div>
          <span class="status-label">STATUS:READY</span>
        </div>
        <div class="status-item">
          <div class="status-dot status-active"></div>
          <span class="status-label">MODE:ACTIVE</span>
        </div>
      </div>

      <!-- Navigation Grid -->
      <nav class="footer-nav">
        <div class="nav-section">
          <div class="nav-section-label">// PRIMARY_NAVIGATION</div>
          <a :href="homeLink" class="nav-link">
            <span class="nav-bracket">[</span>
            <span class="nav-text">{{ $t("footer.home") }}</span>
            <span class="nav-bracket">]</span>
          </a>
          <a :href="blogLink" class="nav-link">
            <span class="nav-bracket">[</span>
            <span class="nav-text">{{ $t("footer.blog") }}</span>
            <span class="nav-bracket">]</span>
          </a>
          <a :href="aboutLink" class="nav-link">
            <span class="nav-bracket">[</span>
            <span class="nav-text">{{ $t("footer.about") }}</span>
            <span class="nav-bracket">]</span>
          </a>
        </div>

        <div class="nav-section">
          <div class="nav-section-label">// SUPPORT_CHANNELS</div>
          <a :href="faqLink" class="nav-link">
            <span class="nav-bracket">[</span>
            <span class="nav-text">{{ $t("footer.faq") }}</span>
            <span class="nav-bracket">]</span>
          </a>
          <a :href="contactLink" class="nav-link">
            <span class="nav-bracket">[</span>
            <span class="nav-text">{{ $t("footer.contact") }}</span>
            <span class="nav-bracket">]</span>
          </a>
          <a href="https://www.reddit.com/r/FakeOutGame/" target="_blank" rel="noopener noreferrer" class="nav-link">
            <span class="nav-bracket">[</span>
            <span class="nav-text">{{ $t("footer.reddit") }}</span>
            <span class="nav-bracket">]</span>
          </a>
        </div>

        <div class="nav-section">
          <div class="nav-section-label">// LEGAL_DOCUMENTS</div>
          <a :href="privacyLink" class="nav-link">
            <span class="nav-bracket">[</span>
            <span class="nav-text">{{ $t("footer.privacy") }}</span>
            <span class="nav-bracket">]</span>
          </a>
          <a :href="termsLink" class="nav-link">
            <span class="nav-bracket">[</span>
            <span class="nav-text">{{ $t("footer.terms") }}</span>
            <span class="nav-bracket">]</span>
          </a>
        </div>
      </nav>

      <!-- Terminal Divider -->
      <div class="terminal-divider">
        <span v-for="i in 80" :key="i" class="divider-char">─</span>
      </div>

      <!-- Footer Bottom -->
      <div class="footer-bottom">
        <div class="footer-brand">
          <span class="brand-bracket">▸</span>
          <span class="brand-name">FAKEOUT</span>
          <span class="brand-bracket">◂</span>
          <span class="brand-separator">|</span>
          <span class="brand-tagline">REALITY_DETECTION_SYSTEM</span>
        </div>

        <div class="footer-meta">
          <span class="meta-item">
            © {{ new Date().getFullYear() }}
          </span>
          <span class="meta-separator">·</span>
          <span class="meta-item">
            {{ $t("footer.copyright", { year: new Date().getFullYear() }) }}
          </span>
        </div>

        <!-- Binary Pattern -->
        <div class="binary-pattern">
          <span>01001000 01001001</span>
        </div>
      </div>
    </div>

    <!-- Corner Brackets -->
    <div class="corner-bracket corner-top-left"></div>
    <div class="corner-bracket corner-top-right"></div>
    <div class="corner-bracket corner-bottom-left"></div>
    <div class="corner-bracket corner-bottom-right"></div>
  </footer>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { locale } = useI18n();

const homeLink = computed(() => `/${locale.value}`);
const blogLink = computed(() => `/${locale.value}/blog`);
const aboutLink = computed(() => `/${locale.value}/about`);
const faqLink = computed(() => `/${locale.value}/faq`);
const contactLink = computed(() => `/${locale.value}/contact`);
const privacyLink = computed(() => `/${locale.value}/privacy`);
const termsLink = computed(() => `/${locale.value}/terms`);
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=IBM+Plex+Mono:wght@400;600;700&display=swap');

/* ========================================
   FRACTURE FOOTER
   ======================================== */

.fracture-footer {
  background: #0a0a0f;
  border-top: 2px solid rgba(139, 92, 246, 0.3);
  padding: 3rem 1.5rem 2rem;
  font-family: 'IBM Plex Mono', monospace;
  position: relative;
  margin-top: auto;
}

/* ========================================
   BACKGROUND EFFECTS
   ======================================== */

.footer-scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(255, 255, 255, 0.01) 0px,
    rgba(0, 0, 0, 0.02) 1px,
    transparent 2px,
    transparent 3px
  );
  pointer-events: none;
  z-index: 1;
}

.footer-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(139, 92, 246, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(139, 92, 246, 0.02) 1px, transparent 1px);
  background-size: 40px 40px;
  opacity: 0.5;
  z-index: 1;
}

/* ========================================
   CONTAINER
   ======================================== */

.footer-container {
  position: relative;
  z-index: 10;
  max-width: 1400px;
  margin: 0 auto;
}

/* ========================================
   SYSTEM STATUS
   ======================================== */

.system-status {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: status-pulse 2s ease-in-out infinite;
}

.status-online {
  background: #8b5cf6;
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.8);
}

.status-ready {
  background: #ec4899;
  box-shadow: 0 0 8px rgba(236, 72, 153, 0.8);
  animation-delay: 0.3s;
}

.status-active {
  background: #06b6d4;
  box-shadow: 0 0 8px rgba(6, 182, 212, 0.8);
  animation-delay: 0.6s;
}

@keyframes status-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.7;
  }
}

.status-label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.5);
}

/* ========================================
   NAVIGATION
   ======================================== */

.footer-nav {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .footer-nav {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

.nav-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.nav-section-label {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: rgba(236, 72, 153, 0.6);
  margin-bottom: 0.5rem;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  width: fit-content;
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, #8b5cf6, #ec4899);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.nav-link:hover {
  color: #8b5cf6;
  transform: translateX(4px);
}

.nav-link:hover::after {
  transform: scaleX(1);
}

.nav-bracket {
  color: rgba(139, 92, 246, 0.4);
  transition: all 0.3s ease;
}

.nav-link:hover .nav-bracket {
  color: #ec4899;
}

.nav-link:hover .nav-bracket:first-child {
  transform: translateX(-2px);
}

.nav-link:hover .nav-bracket:last-child {
  transform: translateX(2px);
}

/* ========================================
   TERMINAL DIVIDER
   ======================================== */

.terminal-divider {
  overflow: hidden;
  margin: 2rem 0;
  height: 1px;
  display: flex;
  opacity: 0.3;
}

.divider-char {
  color: #8b5cf6;
  font-size: 0.6rem;
  line-height: 1;
  animation: divider-flicker 3s linear infinite;
}

.divider-char:nth-child(even) {
  animation-delay: -1.5s;
}

@keyframes divider-flicker {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

/* ========================================
   FOOTER BOTTOM
   ======================================== */

.footer-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
}

.brand-bracket {
  font-family: 'Archivo Black', sans-serif;
  font-size: 1.25rem;
  color: #8b5cf6;
  animation: bracket-pulse 2s ease-in-out infinite;
}

.brand-bracket:last-of-type {
  animation-delay: 1s;
}

@keyframes bracket-pulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}

.brand-name {
  font-family: 'Archivo Black', sans-serif;
  font-size: 1.25rem;
  letter-spacing: 0.2em;
  color: rgba(255, 255, 255, 0.9);
}

.brand-separator {
  color: rgba(139, 92, 246, 0.4);
}

.brand-tagline {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  color: rgba(236, 72, 153, 0.6);
}

.footer-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
}

.meta-separator {
  color: rgba(139, 92, 246, 0.4);
}

.binary-pattern {
  font-size: 0.65rem;
  color: rgba(139, 92, 246, 0.2);
  letter-spacing: 0.2em;
  margin-top: 0.5rem;
}

/* ========================================
   CORNER BRACKETS
   ======================================== */

.corner-bracket {
  position: absolute;
  width: 20px;
  height: 20px;
  z-index: 5;
}

.corner-bracket::before,
.corner-bracket::after {
  content: '';
  position: absolute;
  background: #8b5cf6;
}

.corner-bracket::before {
  width: 100%;
  height: 2px;
}

.corner-bracket::after {
  width: 2px;
  height: 100%;
}

.corner-top-left {
  top: 1rem;
  left: 1rem;
}

.corner-top-left::before {
  top: 0;
  left: 0;
}

.corner-top-left::after {
  top: 0;
  left: 0;
}

.corner-top-right {
  top: 1rem;
  right: 1rem;
}

.corner-top-right::before {
  top: 0;
  right: 0;
}

.corner-top-right::after {
  top: 0;
  right: 0;
}

.corner-bottom-left {
  bottom: 1rem;
  left: 1rem;
}

.corner-bottom-left::before {
  bottom: 0;
  left: 0;
}

.corner-bottom-left::after {
  bottom: 0;
  left: 0;
}

.corner-bottom-right {
  bottom: 1rem;
  right: 1rem;
}

.corner-bottom-right::before {
  bottom: 0;
  right: 0;
}

.corner-bottom-right::after {
  bottom: 0;
  right: 0;
}
</style>
