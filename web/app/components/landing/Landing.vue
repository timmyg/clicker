<template>
  <layout-basic>
    <div class="site-content">
      <Hero />
      <Products />
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
import Products from '@/components/landing/Products';
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
    Products,
    Pricing,
    Signup,
    FeaturesCards,
    Testimonials,
  },
};
</script>

<style lang="scss">
.muted {
  color: #757575;
}
</style>