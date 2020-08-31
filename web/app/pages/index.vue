<template>
  <div id="app">
    <Landing :posts="allPosts" />
  </div>
</template>

<script>
import Landing from "~/components/landing/Landing";
const contentful = require("contentful");
const client = contentful.createClient({
  space: process.env.NUXT_ENV_CONTENTFUL_SPACE_ID,
  accessToken: process.env.NUXT_ENV_CONTENTFUL_ACCESS_TOKEN
});

export default {
  components: {
    Landing
  },
  head: {
    title: "Clicker: Sports Programming Reimagined",
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        hid: "description",
        name: "description",
        content:
          "TV sports programming platform and app ensuring the best, most relevant games are on at all times"
      },
      { name: "fragment", content: "!" },
      {
        property: "og:title",
        content: `Clicker: Sports Programming Reimagined`
      },
      {
        property: "og:description",
        content: `TV sports programming platform and app ensuring the best, most relevant games are on at all times`
      },
      {
        property: "og:image",
        content: `http://clicker-brand.s3.amazonaws.com/logo-bg.png`
      },
      {
        property: "og:image:secure",
        content: `https://clicker-brand.s3.amazonaws.com/logo-bg.png`
      }
    ]
  },
  mounted() {
    if (this.$segment) {
      this.$segment.page("landing");
    }
  },
  asyncData({ env }) {
    return Promise.all([
      client.getEntries({
        content_type: "blogPost",
        // order: "-fields.date"
        order: "-sys.createdAt"
      })
    ])
      .then(([posts]) => {
        return {
          allPosts: posts.items
        };
      })
      .catch(e => console.error(e));
  },
  data: function() {
    return {
      allPosts: []
    };
  }
};
</script>

<style lang="scss"></style>
