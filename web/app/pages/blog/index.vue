<template>
  <layout-basic>
    <Header v-bind:subtitle="'Blog'"></Header>
    <main>
      <div class="container">
        <div class="columns">
          <div class="column is-offset-2 is-8">
            <div v-for="(post, index) in posts" :key="index">
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
import { createClient } from "~/plugins/contentful.js";
import Header from "@/components/layouts/Header";
import Preview from "~/components/blog/Preview";
import LayoutBasic from "@/components/layouts/Basic";

const client = createClient();
export default {
  components: {
    Header,
    LayoutBasic,
    Preview
  },
  asyncData({ env }) {
    return Promise.all([
      client.getEntries({
        content_type: "blogPost",
        order: "-sys.createdAt"
      })
    ])
      .then(([posts]) => {
        // console.log(JSON.stringify(posts.items[0]));
        return {
          posts: posts.items
        };
      })
      .catch(e => console.error(e));
  }
};
</script>

<style lang="scss" scoped>
// main {
//   padding-top: 100px;
// }
</style>
