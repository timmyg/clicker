<template>
  <layout-basic>
    <Header v-bind:subtitle="'Blog'"></Header>
    <main class="container">
      <div v-for="(post,index) in posts" :key="post.fields.slug + '_' + index">
        <router-link :to="'/blog/' + post.fields.slug">
          <article class="media">
            <figure
              v-bind:style="{ backgroundImage: 'url(' + (post.fields.featuredImage.fields.file.url || 'http://via.placeholder.com/3000x1000') + ')' }"
            >
              <div class="title h3">{{ post.fields.title | truncate(40) }}</div>
              <div class="date h5">{{ post.sys.publishedAt | moment("MMMM D, YYYY") }}</div>
            </figure>
          </article>
        </router-link>
      </div>
    </main>
  </layout-basic>
</template>

<script lang="ts">
import Vue from 'vue';
import Header from '@/components/layouts/Header';
import LayoutBasic from '@/components/layouts/Basic';

export default Vue.extend({
  components: {
    Header,
    LayoutBasic,
  },
  data() {
    return {
      posts: [],
    };
  },
  methods: {
    getPosts() {
      this.$contentful
        .getEntries({
          content_type: 'blogPost',
        })
        .then(res => {
          this.posts = res.items;
          // console.log(this.posts[0].sys.createdAt);
          // this.posts.forEach(element => console.log(element.sys.createdAt));
        })
        .catch(error => {});
    },
  },
  created() {
    this.getPosts();
  },
});
</script>

<style lang="scss" scoped>
.title {
  top: 60px;
  position: relative;
  left: 10px;
  width: 90%;
  color: white;
}
.date {
  position: relative;
  top: 40px;
  float: right;
  color: white;
  padding-right: 20px;
}
figure:hover {
  opacity: 0.6;
}
figure {
  height: 200px;
  background-position: 0 100%;
  background-size: 100%;
}
main {
  padding-top: 50px;
}
</style>