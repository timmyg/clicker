<template>
  <layout-basic>
    <div class="site-content">
      <Hero />
      <Features />
      <FeaturesCards />
      <Pricing />
      <Faq />
      <Testimonials />
      <Signup />
    </div>
  </layout-basic>
</template>

<script>
import Hero from '@/components/landing/Hero';
import Faq from '@/components/landing/Faq';
import Features from '@/components/landing/Features';
import LayoutBasic from '@/components/layouts/Basic';
import Pricing from '@/components/landing/Pricing';
import Signup from '@/components/landing/Signup';
import FeaturesCards from '@/components/landing/FeaturesCards';
import Testimonials from '@/components/landing/Testimonials';
export default {
  components: {
    Faq,
    Features,
    Hero,
    LayoutBasic,
    Pricing,
    Signup,
    FeaturesCards,
    Testimonials,
  },
};
</script>

<style lang="scss" scoped>
// main.site-content {
//   visibility: hidden;
// }
</style>