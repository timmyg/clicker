<template>
  <section class="blog-preview section">
    <div class="container">
      <div class="pricing-inner section-inner">
        <div class="center-content mb-16">
          <div class="container-xs">
            <h2 class="brand-font text-3xl pt-4">
              From the Blog
              <nuxt-link to="/blog" class="text-sm pt-32">→</nuxt-link>
            </h2>
          </div>
        </div>
        <div class>
          <div
            class="wrapper w-1/2 lg:w-1/4 inline-block text-center"
            v-for="(post, index) in recentPosts"
            v-bind:key="index"
          >
            <nuxt-link :to="{ name: 'blog-slug', params: { slug: post.fields.slug } }">
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
              <div class="title brand-font pt-2">{{ post.fields.title | truncate(50) }}</div>
            </nuxt-link>
          </div>

          <!-- <div class="wrapper w-1/2 lg:w-1/6 inline-block text-center">
            <br />
            <nuxt-link to="/blog" class="text-sm pt-32">See more</nuxt-link>
          </div>-->
        </div>
        <!-- <div class="text-center pt-8">
          <nuxt-link to="/blog" class="text-sm">See more</nuxt-link>
        </div>-->
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
  font-size: 14px;
  line-height: normal;
}

.wrapper {
  // height: 130px;
  vertical-align: top;
  // padding: 8px;
}
</style>
