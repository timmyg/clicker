<template>
  <layout-basic>
    <main class="site-content">
      <Hero />
      <Features />
      <Pricing />
      <Faq />
      <Signup />
    </main>
  </layout-basic>
</template>

<script>
import Hero from '@/components/landing/Hero';
import Faq from '@/components/landing/Faq';
import Features from '@/components/landing/Features';
import LayoutBasic from '@/components/layouts/Basic';
import Pricing from '@/components/landing/Pricing';
import Signup from '@/components/landing/Signup';
export default {
  components: {
    Faq,
    Features,
    Hero,
    LayoutBasic,
    Pricing,
    Signup,
  },
};
</script>