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
      <TilesProducts :skip="'manager'" />
    </section>
  </layout-basic>
</template>

<script>
import Header from "@/components/layouts/Header";
import LayoutBasic from "@/components/layouts/Basic";
import Features from "@/components/landing/manager/Features";
import FeaturesCards from "@/components/landing/manager/FeaturesCards";
import TilesProducts from "@/components/landing/TilesProducts";
import CSectionHeader from "@/components/sections/partials/SectionHeader.vue";

export default {
  components: {
    Header,
    Features,
    FeaturesCards,
    TilesProducts,
    CSectionHeader,
    LayoutBasic
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
