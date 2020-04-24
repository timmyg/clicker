<template>
  <layout-basic>
    <div class="site-content">
      <Hero />
      <Announcements />
      <Products />
      <Features />
      <FeaturesCards />
      <BlogPreview :posts="posts" />
      <Pricing />
      <Faq />
      <Testimonials />
      <Signup :dividers="true" />
    </div>
  </layout-basic>
</template>

<script>
import Announcements from "@/components/landing/Announcements";
import BlogPreview from "@/components/landing/BlogPreview";
import Hero from "@/components/landing/Hero";
import Faq from "@/components/landing/Faq";
import Features from "@/components/landing/Features";
import LayoutBasic from "@/components/layouts/Basic";
import Products from "@/components/landing/Products";
import Pricing from "@/components/landing/Pricing";
import Signup from "@/components/landing/Signup";
import FeaturesCards from "@/components/landing/FeaturesCards";
import Testimonials from "@/components/landing/Testimonials";
export default {
  components: {
    Announcements,
    BlogPreview,
    Faq,
    Features,
    Hero,
    LayoutBasic,
    Products,
    Pricing,
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
