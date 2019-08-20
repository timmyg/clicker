<template>
  <layout-basic>
    <Header v-bind:subtitle="'Blog'"></Header>
    <main class="container">
      <div v-for="(post,index) in posts" :key="post.fields.slug + '_' + index">
        <router-link :to="'/blog/' + post.fields.slug">
          <article class="media">
            <figure>
              <img v-if="post.fields.featuredImg" :src="post.fields.featuredImg" alt />
              <img v-else src="http://via.placeholder.com/3000x1000" alt />
            </figure>
            <div class="title h2">{{ post.fields.title }}</div>
            <!-- <p>{{ post.fields.summary }}</p> -->
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
  position: relative;
  bottom: 170px;
  left: 10px;
  color: white;
}
</style>