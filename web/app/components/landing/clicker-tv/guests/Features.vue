<template>
  <section class="features-split section illustration-section-05">
    <div class="container">
      <div class="features-split-inner section-inner">
        <div class="split-wrap invert-mobile">
          <div
            class="split-item reveal-scale-up"
            v-scroll-reveal="{ delay: 200, origin: 'right' }"
          >
            <div class="split-item-content center-content-mobile">
              <h3 class="mt-0 mb-16">Like TouchTunes, but for TVs</h3>
              <p class="m-0">
                After downloading the <b class="brand-font">Clicker TV</b> app,
                your guests can choose the sports they want to watch and change
                the channel instantly from their phone. Check it out on
                <a href="https://apps.apple.com/us/app/clicker-tv/id1471666907"
                  >iOS</a
                >
                and
                <a
                  href="https://play.google.com/store/apps/details?id=com.teamclicker.app"
                  >Android</a
                >. Revenue sharing opportunities available.
              </p>
            </div>
            <div
              class="split-item-image split-item-image-fill is-3d illustration-element-04"
            >
              <ImageFader
                img1="/images/landing/wall-tv-zap.png"
                img2="/images/landing/wall-tv-zap-2.png"
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
};
</script>
