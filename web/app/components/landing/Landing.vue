<template>
  <layout-basic>
    <div class="site-content">
      <Hero />
      <Announcements />
      <Products />
      <PricingV2 pricingSlider />
      <Testimonials />
      <News :posts="posts" />
      <Signup />
    </div>
  </layout-basic>
</template>

<script>
import Announcements from "@/components/landing/Announcements";
import Hero from "@/components/landing/Hero";
import LayoutBasic from "@/components/layouts/Basic";
import PricingV2 from "@/components/landing/PricingV2";
import Signup from "@/components/landing/Signup";
import Testimonials from "@/components/landing/Testimonials";
import Products from "@/components/landing/Products";
import News from "@/components/landing/News";

export default {
  components: {
    Announcements,
    Hero,
    LayoutBasic,
    Products,
    PricingV2,
    Signup,
    Testimonials,
    News
  },
  props: ["posts"]
};
</script>

<style lang="scss">
.muted {
  color: #757575;
}
</style>
