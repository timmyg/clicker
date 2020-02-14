<template>
  <layout-basic>
    <Header v-bind:subtitle="'Blog'"></Header>
    <main class="container">
      <div class="columns">
        <div class="column is-offset-2 is-8"><Post :post="post" /></div>
      </div>
    </main>
  </layout-basic>
</template>

<script>
import Header from "@/components/layouts/Header";
import LayoutBasic from "@/components/layouts/Basic";
import Post from "~/components/blog/Post";

// const client = createClient();
const contentful = require("contentful");
const client = contentful.createClient({
  space: process.env.NUXT_ENV_CONTENTFUL_SPACE_ID,
  accessToken: process.env.NUXT_ENV_CONTENTFUL_ACCESS_TOKEN
});
export default {
  components: {
    Header,
    LayoutBasic,
    Post
  },
  asyncData({ env, params }) {
    const { slug } = params;
    return Promise.all([
      client.getEntries({
        content_type: "blogPost",
        "fields.slug": slug
      })
    ])
      .then(([posts]) => {
        return {
          post: posts.items[0]
        };
      })
      .catch(e => console.error(e));
  }
};
</script>
