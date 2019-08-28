<template>
  <div class="container">
    <div class="columns">
      <div class="column is-offset-2 is-8">
        <p class="subtitle is-6">
          <nuxt-link :to="{name :'blog'}">Back to Blog home</nuxt-link>
        </p>
        <h1 class="title is-2">{{ post.title }}</h1>
        <hr />
        <div class="content">{{post.content}}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { createClient } from '~/plugins/contentful.js';

const client = createClient();
export default {
  //   data() {
  //   return {
  //     post: null,
  //   };
  // },
  asyncData({ env }) {
    const { slug } = this.$route.params;
    return Promise.all([
      client.getEntries({
        content_type: 'blogPost',
        'fields.slug': slug,
      }),
    ]).then(([posts]) => {
      return {
        post: posts.items[0],
      };
    });
  },
};
</script>