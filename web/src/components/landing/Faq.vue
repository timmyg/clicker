<template>
  <div class="container mb-64">
    <div class="pricing-inner section-inner">
      <!-- <h2 class="section-title mt-0 text-center">FAQs</h2> -->
      <div class="pricing-faqs container-sm">
        <h4 class="mt-40 mb-32">FAQs</h4>
        <ul class="accordion">
          <li v-on:click="questionToggle(1)" :class="{'is-open': isOpen(1)}">
            <div class="accordion-title">
              <span>What is the installation and setup process?</span>
              <div class="accordion-icon"></div>
            </div>
            <div class="accordion-body">
              <p>It's simple! We'll send a small device that's already set up with your Wi-Fi. Then, we'll work with you to map your TV labels - a process that takes no more than 5 minutes.</p>
            </div>
          </li>
          <li v-on:click="questionToggle(2)" :class="{'is-open': isOpen(2)}">
            <div class="accordion-title">
              <span>What are tokens, and how do guests get them?</span>
              <div class="accordion-icon"></div>
            </div>
            <div class="accordion-body">
              <p>Tokens are credits your guests can use toward reserving TVs. When signing up, we give them a few to start out, and they can purchase more with a credit card.</p>
            </div>
          </li>
          <li v-on:click="questionToggle(3)" :class="{'is-open': isOpen(3)}">
            <div class="accordion-title">
              <span>What if two people want to watch different channels on the same TV?</span>
              <div class="accordion-icon"></div>
            </div>
            <div class="accordion-body">
              <p>Our platform allows for transparent reservations so that your guests will know which TVs are available to be reserved.</p>
            </div>
          </li>
          <!-- <li v-on:click="questionToggle(4)" :class="{'is-open': isOpen(4)}">
            <div class="accordion-title">
              <span>What if a guest has a TV reserved and wants to change it?</span>
              <div class="accordion-icon"></div>
            </div>
            <div class="accordion-body">
              <p>Our reservations are time based, so guests can freely change channels throughout their reservation period.</p>
            </div>
          </li>-->
          <li v-on:click="questionToggle(5)" :class="{'is-open': isOpen(5)}">
            <div class="accordion-title">
              <span>What cable providers do you support?</span>
              <div class="accordion-icon"></div>
            </div>
            <div class="accordion-body">
              <p>Currently, we support DIRECTV and are adding more providers.</p>
            </div>
          </li>
          <li v-on:click="questionToggle(6)" :class="{'is-open': isOpen(6)}">
            <div class="accordion-title">
              <span>Do all TVs have to be connected?</span>
              <div class="accordion-icon"></div>
            </div>
            <div class="accordion-body">
              <p>We recommend having only a subset of your TVs to allow your staff to control your main TVs. Staff will still be able to manually change any TV at any time.</p>
            </div>
          </li>
          <!-- <li v-on:click="questionToggle(7)" :class="{'is-open': isOpen(7)}">
            <div class="accordion-title">
              <span>I want it! When can I get it?</span>
              <div class="accordion-icon"></div>
            </div>
            <div class="accordion-body">
              <p>We are currently running a pilot with a handful of customers. Leave us your email address below and someone will follow up with you shortly. Hello@tryclicker.com</p>
            </div>
          </li>-->
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
    isOpen(questionNumber) {
      return this.openQuestions.indexOf(questionNumber) > -1;
    },
  },
  data: function() {
    return {
      openQuestions: [],
    };
  },
};
</script>
