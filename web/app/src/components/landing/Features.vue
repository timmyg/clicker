<template>
  <section class="features-split section illustration-section-05">
    <div class="container">
      <div class="features-split-inner section-inner">
        <div class="section-header center-content">
          <div class="container-xs" v-scroll-reveal>
            <h2 class="mt-0 mb-16">Bold startup toolkit</h2>
            <p>Lorem ipsum is common placeholder text used to demonstrate the graphic elements of a document or visual presentation.</p>
          </div>
        </div>
        <div class="split-wrap invert-mobile">
          <div
            class="split-item reveal-scale-up is-revealed"
            v-scroll-reveal="{ delay: 200 , origin: 'left'}"
          >
            <div class="split-item-content center-content-mobile">
              <h3 class="mt-0 mb-16">Lorem ipsum dolor sit</h3>
              <p
                class="m-0"
              >Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            </div>
            <div class="split-item-image split-item-image-fill is-3d illustration-element-03">
              <img src="/images/features-split-image-01.svg" alt="Features split image 01" />
            </div>
          </div>
          <div class="split-item reveal-scale-up" v-scroll-reveal="{ delay: 200 , origin: 'right'}">
            <div class="split-item-content center-content-mobile">
              <h3 class="mt-0 mb-16">Lorem ipsum dolor sit</h3>
              <p
                class="m-0"
              >Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            </div>
            <div class="split-item-image split-item-image-fill is-3d illustration-element-04">
              <img src="/images/features-split-image-02.svg" alt="Features split image 02" />
            </div>
          </div>
          <div class="split-item reveal-scale-up" v-scroll-reveal="{ delay: 200 , origin: 'left'}">
            <div class="split-item-content center-content-mobile">
              <h3 class="mt-0 mb-16">Lorem ipsum dolor sit</h3>
              <p
                class="m-0"
              >Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            </div>
            <div class="split-item-image split-item-image-fill is-3d illustration-element-05">
              <img src="/images/features-split-image-03.svg" alt="Features split image 03" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
