<template>
  <layout-basic>
    <div class="site-content">
      <Hero />
      <Announcements />
      <Products />
      <Features />
      <FeaturesCards />
      <BlogPreview :posts="posts" />
      <!-- <BlogPreviewV2 :posts="posts" /> -->
      <PricingV2 pricingSlider />
      <Faq />
      <Testimonials />
      <Signup :dividers="true" />
    </div>
  </layout-basic>
</template>

<script>
import Announcements from "@/components/landing/Announcements";
import BlogPreview from "@/components/landing/BlogPreview";
// import BlogPreviewV2 from "@/components/landing/BlogPreviewV2";
import Hero from "@/components/landing/Hero";
import Faq from "@/components/landing/Faq";
import Features from "@/components/landing/Features";
import LayoutBasic from "@/components/layouts/Basic";
import Products from "@/components/landing/Products";
import PricingV2 from "@/components/landing/PricingV2";
import Signup from "@/components/landing/Signup";
import FeaturesCards from "@/components/landing/FeaturesCards";
import Testimonials from "@/components/landing/Testimonials";
export default {
  components: {
    Announcements,
    BlogPreview,
    // BlogPreviewV2,
    Faq,
    Features,
    Hero,
    LayoutBasic,
    Products,
    PricingV2,
    Signup,
    FeaturesCards,
    Testimonials
  },
  props: ["posts"]
};
</script>

<style lang="scss">
.muted {
  color: #757575;
}
</style>
