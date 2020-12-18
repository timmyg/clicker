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
      <!-- <ScoreboardMini /> -->
      <Buy />
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
import Buy from "@/components/landing/Buy";
import ScoreboardMini from "@/components/ScoreboardMini";

export default {
  name: "control-center",
  components: {
    Buy,
    CSectionHeader,
    Header,
    Features,
    FeaturesCards,
    TilesProducts,
    LayoutBasic,
    ScoreboardMini
  },
  head() {
    return {
      title: "Clicker Products: " + this.sectionHeader.title,
      meta: [
        {
          hid: "2435345",
          name: "description",
          content: this.sectionHeader.paragraph
        }
      ]
    };
  },
  data() {
    return {
      sectionHeader: {
        title: "Control Center",
        paragraph:
          "Our intelligence learns your location's sports preferences and automates programming throughout the day to create the most relevant mix of sports across your TVs."
      }
    };
  }
};
</script>

<style lang="scss" scoped></style>
