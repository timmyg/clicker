<template>
  <div class="container-sm">
    <div class="newsletter-inner section-inner mb-32">
      <div class="newsletter-header text-center is-revealing">
        <h2 class="section-title mt-0">Stay in the know</h2>
        <p
          class="section-paragraph"
        >Clicker is currently in closed beta, but leave us your email and we'll keep you up to date with our broader launch.</p>
      </div>
      <div class="footer-form newsletter-form field field-grouped is-revealing">
        <div class="control control-expanded">
          <input class="input" type="email" name="email" placeholder="email address">
        </div>
        <div class="control">
          <a class="button button-primary button-block button-shadow" href="#">Submit</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Interested',
  created() {
    console.log('created');
    this.$http
      .get('posts')
      .then(response => {
        this.posts = response.data;
      })
      .catch(e => {
        console.error(e);
      });
  },
};
</script>

