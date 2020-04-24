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
