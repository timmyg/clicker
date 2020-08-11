<template>
  <layout-basic>
    <Header></Header>
    <section class="main">
      <c-section-header
        :data="sectionHeader"
        class="center-content reveal-from-bottom brand-font"
      />
      <ProductsTiles :skip="'manager'" />
    </section>
  </layout-basic>
</template>

<script>
import Header from "@/components/layouts/Header";
import LayoutBasic from "@/components/layouts/Basic";
import FeaturesCards from "@/components/landing/FeaturesCards";
import ProductsTiles from "@/components/landing/ProductsTiles";
import CSectionHeader from "@/components/sections/partials/SectionHeader.vue";

export default {
  components: {
    Header,
    FeaturesCards,
    ProductsTiles,
    CSectionHeader
  },
  data() {
    return {
      sectionHeader: {
        title: "Manager",
        paragraph: "Brief description of manager here"
      }
    };
  }
};
</script>
