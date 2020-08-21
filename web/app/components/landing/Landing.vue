<template>
  <layout-basic>
    <div class="site-content">
      <Hero />
      <Announcements />
      <ScoreboardMini />
      <Products id="products" />
      <Pricing pricingSlider />
      <Testimonials />
      <Blogs :posts="posts" />
      <Signup :text="'Multiple Locations? We have a package for that.'" />
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
import ScoreboardMini from "@/components/ScoreboardMini";

export default {
  components: {
    Announcements,
    Hero,
    LayoutBasic,
    Products,
    Pricing,
    Signup,
    Testimonials,
<<<<<<< HEAD
    Blogs
=======
    Blogs,
    ScoreboardMini
>>>>>>> 0ba83f2de7d4df1120484f5a5bc8044bc12dfefb
  },
  props: ["posts"]
};
</script>

<style lang="scss">
.muted {
  color: #757575;
}
</style>
