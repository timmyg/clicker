<template>
  <layout-basic>
    <Header v-bind:subtitle="'Clicker TV'"></Header>
    clicker tv stuff here
  </layout-basic>
</template>

<script>
import Header from "@/components/layouts/Header";
import LayoutBasic from "@/components/layouts/Basic";

export default {
  components: {
    Header
  }
};
</script>
