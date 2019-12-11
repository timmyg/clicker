<template>
  <layout-basic>
    <Header v-bind:subtitle="'Blog'"></Header>
    <main class="container">
      <div class="columns">
        <div class="column is-offset-2 is-8">
          <Post :post="post" />
        </div>
      </div>
    </main>
  </layout-basic>
</template>

<script>
import Header from '@/components/layouts/Header';
import LayoutBasic from '@/components/layouts/Basic';
import { createClient } from '~/plugins/contentful.js';
import Post from '~/components/blog/Post';

const client = createClient();
export default {
  components: {
    Header,
    LayoutBasic,
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
        return {
          post: posts.items[0],
        };
      })
      .catch(e => console.error(e));
  },
};
</script>
