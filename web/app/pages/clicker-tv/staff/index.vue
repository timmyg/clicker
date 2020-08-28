<template>
  <layout-basic>
    <Header></Header>
    <section class="main">
      <c-section-header :data="sectionHeader" class="center-content reveal-from-bottom brand-font" />
      <!-- <Features /> -->
      <FeaturesCards />
      <Buy />
      <TilesProducts :skip="'manager'" />
    </section>
  </layout-basic>
</template>

<script>
import Header from "@/components/layouts/Header";
import LayoutBasic from "@/components/layouts/Basic";
import Buy from "@/components/landing/Buy";
import Features from "@/components/landing/clicker-tv/staff/Features";
import FeaturesCards from "@/components/landing/clicker-tv/staff/FeaturesCards";
import TilesProducts from "@/components/landing/TilesProducts";
import CSectionHeader from "@/components/sections/partials/SectionHeader.vue";

export default {
  name: "clicker-tv-staff",
  components: {
    Buy,
    Header,
    Features,
    FeaturesCards,
    TilesProducts,
    CSectionHeader,
    LayoutBasic
  },
  // head: {
  //   title: "Clicker Products: " + this.sectionHeader5.title,
  //   meta: [
  //     {
  //       hid: this.sectionHeader6.title,
  //       name: "description",
  //       content: this.sectionHeader7.paragraph
  //     }
  //   ]
  // },
  data() {
    return {
      sectionHeader: {
        title: "Clicker TV for Staff",
        paragraph:
          "Limit the spread of Covid-19 amongst your staff. Shared remotes and tables are common touchpoints - eliminate them and let your staff use their own phones."
      }
    };
  }
};
</script>
