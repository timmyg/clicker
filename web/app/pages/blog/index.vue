<template>
  <layout-basic>
    <Header v-bind:subtitle="'Blog'"></Header>
    <main>
      <div class="container">
        <div class="columns">
          <div class="column is-offset-2 is-8 lg:mt-8">
            <div v-for="(post, index) in posts" :key="index" class="pb-4">
              <Preview :post="post" />
              <hr />
            </div>
          </div>
        </div>
      </div>
    </main>
  </layout-basic>
</template>

<script>
import Header from "@/components/layouts/Header";
import Preview from "~/components/blog/Preview";
import LayoutBasic from "@/components/layouts/Basic";

const contentful = require("contentful");
const client = contentful.createClient({
  space: process.env.NUXT_ENV_CONTENTFUL_SPACE_ID,
  accessToken: process.env.NUXT_ENV_CONTENTFUL_ACCESS_TOKEN
});
export default {
  components: {
    Header,
    LayoutBasic,
    Preview
  },
  head: {
    title: "Clicker Blog",
    meta: [
      {
        hid: "blog",
        name: "description",
        content: "Learn about Clicker products and industry news"
      }
    ]
  },
  asyncData({ env }) {
    return Promise.all([
      client.getEntries({
        content_type: "blogPost",
        order: "-fields.date"
      })
    ])
      .then(([posts]) => {
        return {
          posts: posts.items
        };
      })
      .catch(e => console.error(e));
  }
};
</script>

<style lang="scss" scoped>
@import "tailwindcss";
</style>
