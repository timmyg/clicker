<template>
  <div class="container mb-64">
    <div class="pricing-inner section-inner">
      <!-- <h2 class="section-title mt-0 text-center">FAQs</h2> -->
      <div class="pricing-faqs container-sm">
        <h4 class="mt-40 mb-32" v-scroll-reveal>FAQs</h4>
        <ul class="accordion">
          <li
            v-on:click="questionToggle(1)"
            :class="{ 'is-open': isOpen(1) }"
            v-scroll-reveal="{ origin: 'right', delay: 40, distance: '10px' }"
          >
            <div class="accordion-title">
              <span>What is the installation and setup process?</span>
              <div class="accordion-icon"></div>
            </div>
            <div class="accordion-body">
              <p>
                It's simple! All you need is an internet connection. We'll install a small device and ensure your
                DIRECTV boxes are internet enabled.
              </p>
            </div>
          </li>
          <li
            v-on:click="questionToggle(2)"
            :class="{ 'is-open': isOpen(2) }"
            v-scroll-reveal="{ origin: 'right', delay: 80, distance: '10px' }"
          >
            <div class="accordion-title">
              <span>How do guests change the TVs themselves?</span>
              <div class="accordion-icon"></div>
            </div>
            <div class="accordion-body">
              <p>
                Guests can purchase tokens used toward reserving TVs through the
                <span
                  class="brand-font"
                >Clicker TV</span> mobile app. When signing
                up, they start with a few free tokens, and they can purchase more with a credit card.
              </p>
            </div>
          </li>
          <li
            v-on:click="questionToggle(3)"
            :class="{ 'is-open': isOpen(3) }"
            v-scroll-reveal="{ origin: 'right', delay: 120, distance: '10px' }"
          >
            <div class="accordion-title">
              <span>What if two people want to watch different channels on the same TV?</span>
              <div class="accordion-icon"></div>
            </div>
            <div class="accordion-body">
              <p>
                The
                <span class="brand-font">Clicker TV</span> app allows for
                transparent reservations so that your guests will know which TVs are available to be reserved.
              </p>
            </div>
          </li>
          <li
            v-on:click="questionToggle(4)"
            :class="{ 'is-open': isOpen(4) }"
            v-scroll-reveal="{ origin: 'right', delay: 160, distance: '10px' }"
          >
            <div class="accordion-title">
              <span>What cable providers do you support?</span>
              <div class="accordion-icon"></div>
            </div>
            <div class="accordion-body">
              <p>
                Currently, we support
                <a href="https://www.directv.com" target="_blank">DIRECTV</a>. Contact us with your provider if you are
                interested in another provider being added.
              </p>
            </div>
          </li>
          <li
            v-on:click="questionToggle(5)"
            :class="{ 'is-open': isOpen(5) }"
            v-scroll-reveal="{ origin: 'right', delay: 200, distance: '10px' }"
          >
            <div class="accordion-title">
              <span>Do all TVs have to be connected?</span>
              <div class="accordion-icon"></div>
            </div>
            <div class="accordion-body">
              <p>
                We recommend having 50-75% of your TVs on
                <span class="brand-font">Control Center</span>, and around 25% enabled with the
                <span class="brand-font">Clicker TV</span> app. Staff will still be able to manually change any TV at
                any time.
              </p>
            </div>
          </li>
          <li
            v-on:click="questionToggle(6)"
            :class="{ 'is-open': isOpen(6) }"
            v-scroll-reveal="{ origin: 'right', delay: 240, distance: '10px' }"
          >
            <div class="accordion-title">
              <span>Will the TV potentially change at a certain time if a guest is watching a specific game?</span>
              <div class="accordion-icon"></div>
            </div>
            <div class="accordion-body">
              <p>
                No - our system can track the manual change inside your location, and disable our
                <b
                  class="brand-font"
                >Control Center</b> automation until the game completes.
              </p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Faq",
  methods: {
    questionToggle(value) {
      var i = this.openQuestions.indexOf(value);
      if (i === -1) {
        this.openQuestions.push(value);
      } else {
        this.openQuestions.splice(i, 1);
      }
    },
    isOpen(questionNumber) {
      return this.openQuestions.indexOf(questionNumber) > -1;
    }
  },
  data: function() {
    return {
      openQuestions: []
    };
  }
};
</script>
