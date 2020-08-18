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
  data() {
    return {
      sectionHeader: {
        title: "Clicker TV for Staff",
        paragraph:
          "Eliminate the stress of tracking down remotes to change one box while not interfering with others. Allow your staff to change TVs to sports programs right from their own smartphone."
      }
    };
  }
};
</script>
