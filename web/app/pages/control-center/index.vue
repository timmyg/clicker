<template>
  <layout-basic>
    <Header v-bind:subtitle="'Control Center'"></Header>
    <section class="main">
      <Features />
      <FeaturesCards />
    </section>
  </layout-basic>
</template>

<script>
import Header from "@/components/layouts/Header";
import LayoutBasic from "@/components/layouts/Basic";
import Features from "@/components/landing/Features";
import FeaturesCards from "@/components/landing/FeaturesCards";

export default {
  components: {
    Header,
    Features,
    FeaturesCards
  }
};
</script>
