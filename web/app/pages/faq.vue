<template>
  <div>
    <Header v-bind:subtitle="'FAQ'" />
    <section class="main container"><Faq /></section>
  </div>
</template>

<script>
import Header from "@/components/layouts/Header";
import LayoutBasic from "@/components/layouts/Basic";
import Faq from "@/components/landing/Faq";

export default {
  components: {
    Faq,
    Header,
    LayoutBasic
  },
  head: {
    title: "FAQ",
    meta: [
      {
        hid: "faq",
        name: "description",
        content: "frequently asked questions about Clicker"
      }
    ]
  }
};
</script>
