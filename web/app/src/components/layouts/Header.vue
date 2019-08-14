<template>
  <header class="site-header">
    <div class="container">
      <div class="site-header-inner">
        <div
          class="brand"
          v-scroll-reveal.reset="{ easing: 'cubic-bezier(0.5, 0, 0, 1)', distance: '10px', origin: 'top', rotate : { z: -20 }}"
        >
          <h1 class="m-0">
            <a href="./">
              <!-- <img src="./dist/images/logo.svg" alt="Twist" width="32" height="32" /> -->
              <img
                src="https://clicker-brand.s3.amazonaws.com/logo.png"
                width="150"
                alt="Clicker logo"
              />
            </a>
          </h1>
        </div>
        <button
          id="header-nav-toggle"
          class="header-nav-toggle"
          aria-controls="primary-menu"
          aria-expanded="false"
        >
          <span class="screen-reader">Menu</span>
          <span class="hamburger">
            <span class="hamburger-inner"></span>
          </span>
        </button>
        <nav
          id="header-nav"
          class="header-nav"
          v-scroll-reveal.reset="{ delay: 200 , origin: 'right'}"
        >
          <div class="header-nav-inner">
            <ul class="list-reset text-xxs header-nav-right">
              <li>
                <a href="./additional.html">Secondary page</a>
              </li>
            </ul>
            <ul class="list-reset header-nav-right">
              <li>
                <a class="button button-primary button-sm" href="#signup-form">Sign up</a>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
</style>

<script>
export default {
  mounted() {
    // 'use strict';
    const navToggle = document.getElementById('header-nav-toggle');
    const mainNav = document.getElementById('header-nav');

    if (navToggle) {
      // Open menu
      navToggle.addEventListener('click', function() {
        document.body.classList.toggle('off-nav-is-active');
        mainNav.classList.toggle('is-active');
        if (mainNav.style.maxHeight) {
          mainNav.style.maxHeight = null;
        } else {
          mainNav.style.maxHeight = mainNav.scrollHeight + 'px';
        }
        this.getAttribute('aria-expanded') === 'true'
          ? this.setAttribute('aria-expanded', 'false')
          : this.setAttribute('aria-expanded', 'true');
      });
      // Close menu
      document.addEventListener('click', function(e) {
        if (e.target !== mainNav && e.target !== navToggle && !mainNav.contains(e.target)) {
          document.body.classList.remove('off-nav-is-active');
          mainNav.classList.remove('is-active');
          mainNav.style.maxHeight = null;
          navToggle.setAttribute('aria-expanded', 'false');
        }
      });
    }
  },
};
</script>

<style lang="scss" scoped>
header {
  top: 40px;
}
</style>