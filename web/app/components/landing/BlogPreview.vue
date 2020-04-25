<template>
  <section class="blog-preview section">
    <div class="container">
      <div class="pricing-inner section-inner">
        <div class="center-content mb-16">
          <div class="container-xs">
            <h2 class="m-0" v-scroll-reveal>From the Blog</h2>
          </div>
        </div>
        <div class="center-content container mb-64">
          <!-- <div class="container mb-64" v-if="latestPost">{{latestPost.fields.title}}</div>
          <div class="container mb-64" v-if="randomPost">{{randomPost.fields.title}}</div>-->
          <div v-for="(post, index) in posts" v-bind:key="index">
            <nuxt-link
              :to="{ name: 'blog-slug', params: { slug: post.fields.slug } }"
              class="title"
              v-if="[0, 1, randomPostIndex].includes(index)"
            >{{ post.fields.title }}</nuxt-link>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  props: ["posts"],
  computed: {
    latestPost: function() {
      return this.posts[0];
    },
    randomPostIndex: function() {
      // random number between 1 and posts.length
      return Math.floor(Math.random() * this.posts.length + 1);
    }
  }
};
</script>
