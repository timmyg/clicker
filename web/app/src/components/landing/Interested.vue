<template>
  <div class="container-sm">
    <div class="newsletter-inner section-inner mb-32">
      <div class="newsletter-header text-center">
        <h2 class="section-title mt-0">Stay in the know</h2>
        <p class="section-paragraph">
          <span class="brand-font">Clicker</span> is currently piloting in a few select locations, leave us your email and we'll follow up with more information.
        </p>
        <Signup class="center"/>
      </div>
    </div>
  </div>
</template>

<script>
import Signup from './Signup';
export default {
  name: 'Interested',
  components: {
    Signup,
  },
};
</script>
