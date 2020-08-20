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
      <TilesProducts :skip="'clicker-tv'" />
    </section>
  </layout-basic>
</template>

<script>
import Header from "@/components/layouts/Header";
import LayoutBasic from "@/components/layouts/Basic";
import Features from "@/components/landing/clicker-tv/guests/Features";
import FeaturesCards from "@/components/landing/clicker-tv/guests/FeaturesCards";
import TilesProducts from "@/components/landing/TilesProducts";
import CSectionHeader from "@/components/sections/partials/SectionHeader.vue";
import Buy from "@/components/landing/Buy";

export default {
  name: "clicker-tv-guests",
  components: {
    Buy,
    Header,
    Features,
    FeaturesCards,
    TilesProducts,
    CSectionHeader,
    LayoutBasic
  },
  head: {
    title: "Clicker Products: " + this.title,
    meta: [
      {
        hid: this.title,
        name: "description",
        content: this.sectionHeader.paragraph
      }
    ]
  },
  data() {
    return {
      sectionHeader: {
        title: "Clicker TV for Guests",
        paragraph:
          "The ultimate personalized VIP guest experience. Enable your guests to control a TV themselves from their own smartphone. This guest is a sports enthusiast that will stay longer and keep coming back knowing they can always watch their games."
      }
    };
  }
};
</script>
