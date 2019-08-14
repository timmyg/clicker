<template>
  <section class="cta section center-content-mobile">
    <div class="container">
      <div class="cta-inner section-inner cta-split has-top-divider has-bottom-divider">
        <div class="cta-slogan reveal-from-left is-revealed">
          <h3 class="m-0">Nisi porta lorem mollis aliquam ut.</h3>
        </div>
        <form
          class="footer-form newsletter-form field field-grouped"
          v-on:submit.prevent="onSubmit"
        >
          <div class="control control-expanded">
            <input class="input" type="email" placeholder="Enter your email" v-model.trim="email" />
          </div>
          <div class="control">
            <button
              type="submit"
              :disabled="submitting"
              class="button button-primary button-block button-shadow"
            >Learn More</button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>
