<template>
  <layout-basic>
    <Header v-bind:subtitle="'Manager Mode'"></Header>
    manager mode stuff here
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
