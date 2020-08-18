<template>
  <section class="hero section illustration-section-01">
    <Header />
    <div class="container">
      <div class="hero-inner section-inner">
        <div class="split-wrap">
          <div class="split-item">
            <div class="hero-content split-item-content center-content-mobile">
              <h2 class="mt-0 mb-16">
                <span>You pay a lot for DIRECTV.</span> <br />
                <span class="reversed">Take Advantage of It.</span>
              </h2>
              <p class="m-0 mb-24">
                Clicker integrates into your existing DIRECTV to automagically
                manage channel changes + provides an app for your staff and
                guests.
              </p>
              <div><SignupForm /></div>
            </div>
            <div
              class="hero-figure is-3d split-item-image split-item-image-fill illustration-element-01"
            >
              <!-- <img src="/images/landing/clicker-in-bar.png" alt="Crowded bar with tvs" /> -->
              <video preload="auto" controls>
                <source
                  src="https://clicker-assets.s3.amazonaws.com/video/clicker-v1.mp4"
                  type="video/mp4"
                />
                <!-- <source src="video.ogg" type="video/ogg"> -->
                <source
                  src="https://clicker-assets.s3.amazonaws.com/video/clicker-v1.webm"
                  type="video/webm"
                />
                <object
                  data="https://clicker-assets.s3.amazonaws.com/video/clicker-v1.mp4"
                  width="470"
                  height="255"
                >
                  <!-- <embed src="video.swf" width="470" height="255"> -->
                </object>
              </video>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import Header from "@/components/layouts/Header";
import SignupForm from "@/components/landing/SignupForm";
export default {
  components: { Header, SignupForm }
};
</script>

<style lang="scss" scoped>
.hero {
  .hero-content {
    z-index: 1;
  }
  div.hero-inner {
    padding-top: 96px;
  }
}
.reversed {
  background: black;
  color: white;
  padding: 4px 8px;
  line-height: 1.5em;
}

// > large
@media (min-width: 820px) {
  .container .split-wrap .split-item {
    .split-item-content {
      width: 598px;
    }
  }
}
</style>
