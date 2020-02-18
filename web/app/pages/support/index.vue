<template>
  <layout-basic>
    <Header v-bind:subtitle="'Scoreboard'"></Header>
    <section class="main text-center">
      <p>
        Use the chat widget below, or
        <a href="mailto:hello@tryclicker.com" class="font-bold">email us</a>.
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
  }
};
</script>

<style lang="scss" scoped>
@import "tailwindcss";
section.main {
  padding-top: 100px;
}
</style>
