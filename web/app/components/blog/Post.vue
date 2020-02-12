<template>
  <article>
    <h2 class="text-3xl brand-font">{{ post.fields.title }}</h2>
    <div class="text-sm text-gray-500">
      {{ (post.fields.date || post.sys.createdAt) | moment("MMMM Do YYYY") }} by
      {{ post.fields.author }}
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
      <div
        v-html="$md.render(post.fields.content)"
        class="leading-relaxed"
      ></div>
    </div>
    <hr />
    <Signup />
  </article>
</template>

<script>
import Signup from "@/components/landing/Signup";
export default {
  props: ["post"],
  components: { Signup }
};
</script>

<style lang="scss" scoped>
@import "tailwindcss";
ul {
  list-style: inherit;
}
</style>
