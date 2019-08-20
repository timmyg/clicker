<template>
  <layout-basic>
    <Header v-bind:subtitle="'Blog'"></Header>
    <main v-if="post">
      <article class="media">
        <figure>
          <img v-if="post.fields.featuredImg" :src="post.fields.featuredImg" alt />
          <img v-else src="http://via.placeholder.com/3000x1000" alt />
        </figure>
        <div class="container">
          <div class="title h2">{{ post.fields.title }}</div>
          <RichTextRenderer :document="post.fields.content" />
        </div>
      </article>
    </main>
  </layout-basic>
</template>

<script lang="ts">
import Vue from 'vue';
import RichTextRenderer from 'contentful-rich-text-vue-renderer';
import Header from '@/components/layouts/Header';
import LayoutBasic from '@/components/layouts/Basic';
export default Vue.extend({
  components: {
    Header,
    LayoutBasic,
    RichTextRenderer,
  },
  data() {
    return {
      post: null,
    };
  },
  methods: {
    getPost() {
      const { slug } = this.$route.params;
      console.log(slug);
      this.$contentful
        .getEntries({
          content_type: 'blogPost',
          'fields.slug': slug,
        })
        .then(res => {
          this.post = res.items[0];
          console.log(this.post.fields.content);
        })
        .catch(error => console.error(error));
    },
  },
  created() {
    this.getPost();
  },
});
</script>

<style lang="scss" scoped>
.title {
  position: relative;
  top: -140px;
  color: white;
  text-align: center;
}
main {
  padding-top: 50px;
}
</style>