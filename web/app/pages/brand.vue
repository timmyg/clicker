<template>
  <Brand />
</template>

<script>
import Brand from "~/components/Brand";

export default {
  components: {
    Brand
  },
  head: {
    title: "Clicker Brand",
    meta: [
      {
        hid: "brand",
        name: "description",
        content: "Clicker Brand and Press details"
      }
    ]
  }
};
</script>

<style lang="scss">
@import "~/assets/css/chota.min.css";
</style>
