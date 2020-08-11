<template>
  <layout-basic>
    <Header></Header>
    <section class="main">
      <c-section-header
        :data="sectionHeader"
        class="center-content reveal-from-bottom brand-font"
      />
      <Features />
      <FeaturesCards />
      <ProductsTiles :skip="'control-center'" />
    </section>
  </layout-basic>
</template>

<script>
import Header from "@/components/layouts/Header";
import LayoutBasic from "@/components/layouts/Basic";
import Features from "@/components/landing/FeaturesControlCenter";
import FeaturesCards from "@/components/landing/FeaturesCards";
import ProductsTiles from "@/components/landing/ProductsTiles";
import CSectionHeader from "@/components/sections/partials/SectionHeader.vue";

export default {
  components: {
    CSectionHeader,
    Header,
    Features,
    FeaturesCards,
    ProductsTiles
  },
  data() {
    return {
      sectionHeader: {
        title: "Control Center",
        paragraph: "Brief description of control center here"
      }
    };
  }
};
</script>
