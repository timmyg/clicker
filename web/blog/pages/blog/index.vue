<template>
  <div class="container">
    <div class="columns">
      <div class="column is-offset-2 is-8">
        <h1 class="title is-2">Latest Posts</h1>
        <hr />
        <h2 class="title is-4" v-for="(post, index) in posts" :key="index">
          <!-- <nuxt-link :to="{name: '', params: { slug : post.fields.slug }}">{{ post.fields.title }}</nuxt-link> -->
          <nuxt-link
            :to="{ name: 'blog-slug', params: { slug: post.fields.slug }}"
            class="title"
          >{{ post.fields.title }}</nuxt-link>
          <!-- </h4> -->
          <!-- <div class="tags"> -->
          <!-- <nuxt-link
              v-for="tag in post.fields.tags"
              :key="tag"
              :to="{ name: 'tags-tag', params: { tag: tag }}" class="tag">{{ tag }}</nuxt-link>
          </div>-->
        </h2>
      </div>
    </div>
  </div>
</template>

<script>
import { createClient } from '~/plugins/contentful.js';

const client = createClient();
export default {
  asyncData({ env }) {
    return Promise.all([
      client.getEntries({
        content_type: 'blogPost',
        order: '-sys.createdAt',
      }),
    ])
      .then(([posts]) => {
        console.log(posts.items[0].fields);
        return {
          posts: posts.items,
        };
      })
      .catch(e => console.error(e));
  },
};
</script>