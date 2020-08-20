<template>
  <layout-basic>
    <Header v-bind:subtitle="'Scoreboard'"></Header>
    <section class="main text-center">
      <p>
        For <b>general support</b>, use the chat widget below, or email us at
        <a href="mailto:hello@tryclicker.com" class="font-bold text-blue-400"
          >hello@tryclicker.com</a
        >.
      </p>
      <br />
      <p>
        To finish <b>setting up</b> your Clicker device, send us a chat or set
        up an appointment
        <a
          href="https://calendly.com/clicker-tim-g/meet"
          target="_blank"
          class="font-bold right schedule-call text-blue-400"
          >here</a
        >
      </p>
    </section>
  </layout-basic>
</template>

<script>
import Header from "@/components/layouts/Header";
import LayoutBasic from "@/components/layouts/Basic";

export default {
  mounted() {
    if (window.drift) {
      window.drift.api.openChat();
    }
  },
  components: {
    Header,
    LayoutBasic
  },
  head: {
    title: "Clicker Support",
    meta: [
      {
        hid: "support",
        name: "description",
        content: "Get support from Clicker"
      }
    ]
  }
};
</script>

<style lang="scss" scoped>
@import "tailwindcss";
section.main {
  padding-top: 100px;
  min-height: 50vh;
}
</style>
