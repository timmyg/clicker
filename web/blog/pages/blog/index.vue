<template>
  <div class="container">
    <div class="columns">
      <div class="column is-offset-2 is-8">
        <h1 class="title is-2">Latest Posts</h1>
        <hr />
        <h2 class="title is-4" v-for="(post, index) in posts" :key="index">
          <Preview :post="post" />
        </h2>
      </div>
    </div>
  </div>
</template>

<script>
import { createClient } from '~/plugins/contentful.js';
import Preview from '~/components/blog/Preview';

const client = createClient();
export default {
  components: {
    Preview,
  },
  asyncData({ env }) {
    return Promise.all([
      client.getEntries({
        content_type: 'blogPost',
        order: '-sys.createdAt',
      }),
    ])
      .then(([posts]) => {
        console.log(JSON.stringify(posts.items[0]));
        return {
          posts: posts.items,
        };
      })
      .catch(e => console.error(e));
  },
};
</script>