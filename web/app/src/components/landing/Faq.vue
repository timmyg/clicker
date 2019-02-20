<template>
  <div class="container mb-64">
    <div class="pricing-inner section-inner">
      <!-- <h2 class="section-title mt-0 text-center">FAQs</h2> -->
      <div class="pricing-faqs container-sm ">
        <h4 class="mt-40 mb-32">FAQs</h4>
        <ul class="accordion">
          <li v-on:click="questionToggle(1)" :class="{'is-open': openQuestions.indexOf(1) > -1}">
            <div class="accordion-title">
              <span>In a professional context it often happens that private?</span>
              <div class="accordion-icon"></div>
            </div>
            <div class="accordion-body">
              <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam</p>
            </div>
          </li>
          <li v-on:click="questionToggle(2)" :class="{'is-open': openQuestions.indexOf(2) > -1}">
            <div class="accordion-title">
              <span>Lorem ipsum dolor sit amet, consectetur</span>
              <div class="accordion-icon"></div>
            </div>
            <div class="accordion-body">
              <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam. Ut enim ad minim veniam semper. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            </div>
          </li>
          <li v-on:click="questionToggle(3)" :class="{'is-open': openQuestions.indexOf(3) > -1}">
            <div class="accordion-title">
              <span>In a professional context it often happens that private?</span>
              <div class="accordion-icon"></div>
            </div>
            <div class="accordion-body">
              <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam</p>
            </div>
          </li>
          <li v-on:click="questionToggle(4)" :class="{'is-open': openQuestions.indexOf(4) > -1}">
            <div class="accordion-title">
              <span>Lorem ipsum dolor sit amet, consectetur</span>
              <div class="accordion-icon"></div>
            </div>
            <div class="accordion-body">
              <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam. Ut enim ad minim veniam semper. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Faq',
  methods: {
    questionToggle(value) {
        var i = this.openQuestions.indexOf(value);
        if (i === -1) {
            this.openQuestions.push(value);
        } else {
            this.openQuestions.splice(i, 1);
        }
    },
  },
  data: function () {
    return {
      openQuestions: [],
    }
  }
};
</script>
