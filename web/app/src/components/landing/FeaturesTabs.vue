<template>
  <div class="container">
    <div class="features-tabs-inner section-inner has-top-divider">
      <div class="tabs-container">
        <ul class="tabs-links">
          <li class="is-revealing">
            <a href="#tab-1" class="tab-link is-active" v-on:click="tabClick($event)">
              <img src="/img/tabs-icon-01.svg" alt="Tabs icon 01">
              <span class="h4 m-0">Flip to the Game</span>
            </a>
          </li>
          <li class="is-revealing">
            <a href="#tab-2" class="tab-link" v-on:click="tabClick($event)">
              <img src="/img/tabs-icon-02.svg" alt="Tabs icon 02">
              <span class="h4 m-0">Network Effects</span>
            </a>
          </li>
          <li class="is-revealing">
            <a href="#tab-3" class="tab-link" v-on:click="tabClick($event)">
              <img src="/img/tabs-icon-03.svg" alt="Tabs icon 03">
              <span class="h4 m-0">Know your Customers</span>
            </a>
          </li>
        </ul>
        <div class="tabs-content" scroll-reveal>
          <div id="tab-1" class="tab-panel is-active">
            <h3>Just Like Your Living Room Couch</h3>
            <p
              class="mt-32"
            >Through the use of our phone app, patrons at the restaurant will be able to pick the channel they want to watch for a purchased timeframe.</p>
          </div>
          <div id="tab-2" class="tab-panel">
            <h3>Be the Place Everyone Wants to Be</h3>
            <p
              class="mt-32"
            >With their new superpower, your patrons will not only come back time and time again, but bring their family and friends.</p>
          </div>
          <div id="tab-3" class="tab-panel">
            <h3>Data is King</h3>
            <p
              class="mt-32"
            >While passively learning your customers favorite teams, we can retarget and push them deals to come in the next time their teams are on.</p>
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
