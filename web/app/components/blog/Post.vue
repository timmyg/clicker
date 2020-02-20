<template>
  <article>
    <h2 class="text-3xl brand-font">{{ post.fields.title }}</h2>
    <div class="text-sm text-gray-500">
      {{ (post.fields.date || post.sys.createdAt) | moment("MMMM Do YYYY") }} by
      {{ post.fields.author }}
    </div>
    <div class="tags" v-if="post.fields.tags">
      <span
        v-for="tag in getTags()"
        :key="tag"
        :to="{ name: 'tags-tag', params: { tag: tag } }"
        class="text-sm text-gray-500"
      >{{ tag }}</span>
    </div>
    <img
      v-if="post.fields.featuredImage"
      class="py-8"
      :src="
        post.fields.featuredImage.fields.file.url +
          '?fit=fill&w=1500&h=450&f=center&r=16'
      "
    />
    <div class="xl:px-16">
      <div v-html="$md.render(post.fields.content)" class="leading-relaxed"></div>
    </div>
    <hr />
    <Signup />
  </article>
</template>

<script>
import Signup from "@/components/landing/Signup";
export default {
  props: ["post"],
  components: { Signup },
  methods: {
    getTags() {
      return this.post.fields.tags
        .split(",")
        .map(tag => tag.toLowerCase().trim());
    }
  }
};
</script>

<style lang="scss" scoped>
@import "tailwindcss";
ul {
  list-style: inherit;
}
.tags span {
  background: #f9f9f9;
  border-radius: 5px;
  margin-right: 6px;
  padding: 3px;
}
</style>
