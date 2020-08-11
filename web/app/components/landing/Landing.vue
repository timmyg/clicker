<template>
  <layout-basic>
    <div class="site-content">
      <Hero />
      <Announcements />
      <Products />
      <Pricing pricingSlider />
      <Testimonials />
      <Blogs :posts="posts" />
      <Signup />
    </div>
  </layout-basic>
</template>

<script>
import Announcements from "@/components/landing/Announcements";
import Hero from "@/components/landing/Hero";
import LayoutBasic from "@/components/layouts/Basic";
import Pricing from "@/components/landing/Pricing";
import Signup from "@/components/landing/Signup";
import Testimonials from "@/components/landing/Testimonials";
import Products from "@/components/landing/Products";
import Blogs from "@/components/landing/Blogs";

export default {
  components: {
    Announcements,
    Hero,
    LayoutBasic,
    Products,
    Pricing,
    Signup,
    Testimonials,
    Blogs
  },
  props: ["posts"]
};
</script>

<style lang="scss">
.muted {
  color: #757575;
}
</style>
