<template>
  <div id="app"><Landing /></div>
</template>

<script>
import Landing from "~/components/landing/Landing";

export default {
  components: {
    Landing
  },
  mounted() {
    console.log(this.$segment.page("landing"));
  }
};
</script>

<style lang="scss"></style>
