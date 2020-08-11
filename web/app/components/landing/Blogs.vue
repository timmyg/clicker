<template>
  <section
    class="news section"
    :class="[
      topOuterDivider && 'has-top-divider',
      bottomOuterDivider && 'has-bottom-divider',
      hasBgColor && 'has-bg-color',
      invertColor && 'invert-color'
    ]"
  >
    <div class="container">
      <div
        class="news-inner section-inner"
        :class="[
          topDivider && 'has-top-divider',
          bottomDivider && 'has-bottom-divider'
        ]"
      >
        <c-section-header
          :data="sectionHeader"
          class="center-content reveal-from-bottom pb-16"
        />
        <div class="tiles-wrap" :class="[pushLeft && 'push-left']">
          <div
            class="tiles-item reveal-from-bottom"
            data-reveal-delay="200"
            v-for="(post, index) in recentPosts"
            v-bind:key="index"
          >
            <div class="tiles-item-inner has-shadow">
              <figure class="news-item-image m-0">
                <img
                  :src="
                    post.fields.featuredImage.fields.file.url +
                      '?fit=scale&w=350&h=196&r=16'
                  "
                  :srcset="
                    `${
                      post.fields.featuredImage.fields.file.url
                    }?w=350&h=196&fit=fill 350w`
                  "
                  :alt="post.fields.featuredImage.fields.title"
                />
              </figure>
              <div class="news-item-content">
                <div class="news-item-body">
                  <div class="news-item-title  text-md mt-8 mb-8">
                    <nuxt-link
                      :to="{
                        name: 'blog-slug',
                        params: { slug: post.fields.slug }
                      }"
                      >{{ post.fields.title | truncate(50) }} →</nuxt-link
                    >
                  </div>
                  <!-- <p class="mb-16 text-sm">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut et dolore magna aliqua. Ut
                    enim ad minim veniam, quis nostrud exercitation ullamco
                    laboris nisi ut aliquip ex.
                  </p> -->
                </div>
                <!-- <div class="news-item-more text-xs TEXT-M mb-8 center-content">
                  <nuxt-link
                    :to="{
                      name: 'blog-slug',
                      params: { slug: post.fields.slug }
                    }"
                    >Read More</nuxt-link
                  >
                </div> -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { SectionTilesProps } from "@/utils/SectionProps.js";
import CSectionHeader from "@/components/sections/partials/SectionHeader.vue";
import CImage from "@/components/elements/Image.vue";

export default {
  name: "CNews",
  components: {
    CSectionHeader,
    CImage
  },
  props: ["posts"],

  mixins: [SectionTilesProps],
  data() {
    return {
      sectionHeader: {
        title: "From the Blog"
      }
    };
  },
  computed: {
    recentPosts: function() {
      return this.posts.slice(0, 3);
    }
  }
};
</script>

<style lang="scss" scoped>
.tiles-item-inner {
  padding: 14px;
  text-align: center;
}
</style>
