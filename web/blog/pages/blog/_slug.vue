<template>
  <div class="container">
    <div class="columns">
      <div class="column is-offset-2 is-8">
        <p class="subtitle is-6">
          <nuxt-link :to="{name :'blog'}">Back to Blog home</nuxt-link>
        </p>
        <h1 class="title is-2">{{ post.fields.title }}</h1>
        <hr />
        <div class="content">{{post.fields.content}}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { createClient } from '~/plugins/contentful.js';

const client = createClient();
export default {
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