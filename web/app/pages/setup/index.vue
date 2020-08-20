<template>
  <Setup />
</template>

<script>
import Setup from "~/components/Setup";

export default {
  components: {
    Setup
  },
  head: {
    title: "Clicker Setup",
    meta: [
      {
        hid: "setup",
        name: "description",
        content:
          "Details for settings up Clicker device to enable Clicker at your venue"
      }
    ]
  }
};
</script>
