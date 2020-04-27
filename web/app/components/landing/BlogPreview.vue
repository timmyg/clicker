<template>
  <section class="blog-preview section">
    <div class="container">
      <div class="pricing-inner section-inner">
        <div class="center-content mb-16">
          <div class="container-xs">
            <!-- <h2 class="m-0" v-scroll-reveal>From the Blog</h2> -->
            <h2 class="brand-font text-3xl pt-4">From the Blog</h2>
          </div>
        </div>
        <div class>
          <div
            class="w-1/2 lg:w-1/4 inline-block text-center"
            v-for="(post, index) in recentPosts"
            v-bind:key="index"
          >
            <nuxt-link
              :to="{ name: 'blog-slug', params: { slug: post.fields.slug } }"
              class="wrapper"
            >
              <img
                v-if="post.fields.featuredImage"
                class="primary thumbnail"
                :src="
            post.fields.featuredImage.fields.file.url +
              '?fit=scale&w=350&h=196&r=16'
          "
                :srcset="
            `${
              post.fields.featuredImage.fields.file.url
            }?w=350&h=196&fit=fill 350w`
          "
                sizes="(min-width: 1024px) 400px, 100vw"
              />
              <div class="title">{{ post.fields.title }}</div>
            </nuxt-link>
          </div>
          <!-- ... -->
          <!-- <div class="w-1/2 lg:w-1/4 inline-block">9</div> -->
        </div>
        <div class="text-center">
          <a href="/blog">See more</a>
        </div>
        <!-- <div class="center-content container mb-64">
          <div v-for="(post, index) in posts" v-bind:key="index">
            <nuxt-link
              :to="{ name: 'blog-slug', params: { slug: post.fields.slug } }"
              class="title"
              v-if="[0, 1, randomPostIndex].includes(index)"
            >{{ post.fields.title }}</nuxt-link>
          </div>
        </div>-->
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
    },
    recentPosts: function() {
      return this.posts.slice(0, 4);
    }
  }
};
</script>

<style lang="scss" scoped>
@import "tailwindcss";

img {
  width: 200px;
  margin: 0 auto;
}

.title {
  // height: 200px;
}
</style>
