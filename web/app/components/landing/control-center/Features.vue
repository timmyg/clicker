<template>
  <section class="features-split section illustration-section-05">
    <div class="container">
      <div class="features-split-inner section-inner">
        <div class="split-wrap invert-mobile">
          <div class="split-item reveal-scale-up" v-scroll-reveal="{ delay: 200, origin: 'left' }">
            <div class="split-item-content center-content-mobile">
              <h3 class="mt-0 mb-16">🧟 Kill the Zombie TVs</h3>
              <p class="m-0">Deliver a flawless gameday atmosphere that keeps fans coming back.</p>
            </div>
            <div class="split-item-image split-item-image-fill is-3d illustration-element-05">
              <ImageFader
                img1="/images/landing/wall-tvs-more.png"
                img2="/images/landing/wall-tvs-more-dark.png"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import ImageFader from "@/components/ImageFader";

export default {
  components: {
    ImageFader
  }
}
</script>
