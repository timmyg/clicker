<template>
  <div class="container">
    <div class="columns">
      <div class="column is-offset-2 is-8">
        <p class="subtitle is-6">
          <nuxt-link :to="{name :'blog'}">Back</nuxt-link>
        </p>
        <Post :post="post" />
      </div>
    </div>
  </div>
</template>

<script>
import { createClient } from '~/plugins/contentful.js';
import Post from '~/components/blog/Post';

const client = createClient();
export default {
  components: {
    Post,
  },
  asyncData({ env, params }) {
    const { slug } = params;
    return Promise.all([
      client.getEntries({
        content_type: 'blogPost',
        'fields.slug': slug,
      }),
    ])
      .then(([posts]) => {
        console.log(posts.items[0].fields);
        return {
          post: posts.items[0],
        };
      })
      .catch(e => console.error(e));
  },
};
</script>