<template>
  <layout-basic>
    <Header v-bind:subtitle="'Blog'"></Header>
    <main v-if="post">
      <article class="media">
        <figure
          v-bind:style="{ backgroundImage: 'url(' + (post.fields.featuredImage.fields.file.url || 'http://via.placeholder.com/3000x1000') + ')' }"
        ></figure>
        <div class="container">
          <div class="wrapper">
            <div class="title h2">{{ post.fields.title | truncate(40) }}</div>
            <div class="date h5">{{ post.sys.publishedAt | moment("MMMM D, YYYY") }}</div>
          </div>
          <!-- <RichTextRenderer :document="post.fields.content" /> -->
          <!-- <RichTextRenderer :document="post.fields.test" /> -->
          <div v-html="post.fields.content"></div>
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
      this.$contentful
        .getEntries({
          content_type: 'blogPost',
          'fields.slug': slug,
        })
        .then(res => {
          this.post = res.items[0];
          console.log(this.post.fields.test);
          // console.log(this.post.fields.featuredImage.fields.title);
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
.wrapper {
  position: relative;
  top: -140px;
  color: white;
  text-align: center;
  .title,
  .date {
    color: white;
    margin: 0;
  }
  .date {
    margin-top: 8px;
  }
}
// .title {

// }
// .date {
//   color: white;
//   text-align: center;
// }
main {
  padding-top: 50px;
}
figure {
  height: 300px;
  background-position: 0 100%;
  margin-bottom: 0;
  background-size: 600px;
  background-repeat: no-repeat;
}
@include media('>medium') {
  figure {
    background-size: 100%;
  }
}
</style>