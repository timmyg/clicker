<template>
  <layout-basic>
    <Header v-bind:subtitle="'Clicker TV'"></Header>
    <section class="main">
      <Features />
      <FeaturesCards />
      <ProductsTiles />
    </section>
  </layout-basic>
</template>

<script>
import Header from "@/components/layouts/Header";
import LayoutBasic from "@/components/layouts/Basic";
import Features from "@/components/landing/Features";
import FeaturesCards from "@/components/landing/FeaturesCards";
import ProductsTiles from "@/components/landing/ProductsTiles";

export default {
  components: {
    Header,
    Features,
    FeaturesCards,
    ProductsTiles
  }
};
</script>
