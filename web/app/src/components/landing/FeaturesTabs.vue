<template>
  <div class="container">
    <div class="features-tabs-inner section-inner has-top-divider">
      <h2 class="section-title mt-0 mb-64 text-center">Bring Vegas To You</h2>

      <div class="tabs-container">
        <ul class="tabs-links">
          <li class="is-revealing">
            <a href="#tab-1" class="tab-link is-active" v-on:click="tabClick($event)">
              <img src="/img/tabs-icon-01.svg" alt="Tabs icon 01">
              <span class="h4 m-0">Amazing features</span>
            </a>
          </li>
          <li class="is-revealing">
            <a href="#tab-2" class="tab-link" v-on:click="tabClick($event)">
              <img src="/img/tabs-icon-02.svg" alt="Tabs icon 02">
              <span class="h4 m-0">Endless possibilities</span>
            </a>
          </li>
          <li class="is-revealing">
            <a href="#tab-3" class="tab-link" v-on:click="tabClick($event)">
              <img src="/img/tabs-icon-03.svg" alt="Tabs icon 03">
              <span class="h4 m-0">Ease of use</span>
            </a>
          </li>
        </ul>
        <div class="tabs-content" scroll-reveal>
          <div id="tab-1" class="tab-panel is-active">
            <h2>Discover</h2>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            <p
              class="mb-0"
            >A arcu cursus vitae congue. Vel elit scelerisque mauris pellentesque pulvinar pellentesque habitant morbi tristique.</p>
          </div>
          <div id="tab-2" class="tab-panel">
            <h2>Power of customisation</h2>
            <p>A arcu cursus vitae congue. Vel elit scelerisque mauris pellentesque pulvinar pellentesque habitant morbi tristique.</p>
            <p
              class="mb-0"
            >Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. A arcu cursus vitae congue.</p>
          </div>
          <div id="tab-3" class="tab-panel">
            <h2>Keep it simple</h2>
            <p>Sed ut perspiciatis, unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>
            <p
              class="mb-0"
            >Nemo enim ipsam voluptatem, quia voluptas sit, aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos, qui ratione voluptatem sequi nesciunt.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FeaturesTabs',
};
</script>

