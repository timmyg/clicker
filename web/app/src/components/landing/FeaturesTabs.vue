<template>
  <div class="container mt-64 mb-64">
    <div>
      <p class="blurb">Through use of a phone app, guests at your location will be able to pick the channel they want to watch for a purchased timeframe.</p>
      <div class="tabs-container mt-32">
        <ul class="tabs-links">
          <li>
            <a
              href="#tab-1"
              class="tab-link is-active"
              v-on:click="tabClick($event)"
            >
              <span class="h4 m-0">1. Pick your bar or restaurant location</span>
            </a>
          </li>
          <li>
            <a
              href="#tab-2"
              class="tab-link"
              v-on:click="tabClick($event)"
            >
              <span class="h4 m-0">2. Choose the game you want to watch</span>
            </a>
          </li>
          <li>
            <a
              href="#tab-3"
              class="tab-link"
              v-on:click="tabClick($event)"
            >
              <span class="h4 m-0">3. Select the TV you want to watch</span>
            </a>
          </li>
          <li>
            <a
              href="#tab-4"
              class="tab-link"
              v-on:click="tabClick($event)"
            >
              <span class="h4 m-0">4. Select the duration and tune the channel</span>
            </a>
          </li>
        </ul>
        <div
          class="tabs-content"
          scroll-reveal
        >
          <div
            id="tab-1"
            class="tab-panel is-active"
          >
            <img
              src="/img/mockups/1-location.png"
              alt=""
            >
          </div>
          <div
            id="tab-2"
            class="tab-panel"
          >
            <img
              src="/img/mockups/2-game.png"
              alt=""
            >
          </div>
          <div
            id="tab-3"
            class="tab-panel"
          >
            <img
              src="/img/mockups/3-tv.png"
              alt=""
            >
          </div>
          <div
            id="tab-4"
            class="tab-panel"
          >
            <img
              src="/img/mockups/4-confirm.png"
              alt=""
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FeaturesTabs',
  methods: {
    tabClick(e) {
      e.preventDefault();
      const target = e.target;
      let tabLinksContainer = target.parentNode.parentNode;
      let tabPanels = tabLinksContainer.nextElementSibling.getElementsByClassName('tab-panel');
      let tabLinks = tabLinksContainer.getElementsByClassName('tab-link');
      // Remove is-active class from all links and panels
      for (let i = 0; i < tabLinks.length; i++) {
        tabLinks[i].classList.remove('is-active');
      }
      for (let i = 0; i < tabPanels.length; i++) {
        tabPanels[i].classList.remove('is-active');
      }
      // Get the ID of panel to display
      let tabID = target.getAttribute('href');
      // Add is-active class to matching link and panel
      target.classList.add('is-active');
      document.querySelector(tabID).classList.add('is-active');
    },
  },
};
</script>

<style lang="scss" scoped>
img {
  height: 390px;
  max-width: none;
  width: inherit;
}
@include media('>large') { 
  img {
    height: 600px;
  }
  .tabs-links {
    margin-top: 90px;
  }
}
</style>
