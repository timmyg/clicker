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
      <TilesProducts :skip="'control-center'" />
    </section>
  </layout-basic>
</template>

<script>
import Header from "@/components/layouts/Header";
import LayoutBasic from "@/components/layouts/Basic";
import Features from "@/components/landing/control-center/Features";
import FeaturesCards from "@/components/landing/control-center/FeaturesCards";
import TilesProducts from "@/components/landing/TilesProducts";
import CSectionHeader from "@/components/sections/partials/SectionHeader.vue";

export default {
  components: {
    CSectionHeader,
    Header,
    Features,
    FeaturesCards,
    TilesProducts,
    LayoutBasic
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

<style lang="scss" scoped></style>
