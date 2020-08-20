<template>
  <SetupTroubleshooting />
</template>

<script>
import SetupTroubleshooting from "~/components/SetupTroubleshooting";

export default {
  components: {
    SetupTroubleshooting
  },
  head: {
    title: "Clicker Troubleshooting",
    meta: [
      {
        hid: "troubleshooting",
        name: "description",
        content:
          "Troubleshooting tips for connection issues with your Clicker device"
      }
    ]
  }
};
</script>
