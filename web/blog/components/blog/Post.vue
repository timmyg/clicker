<template>
  <article>
    <img
      :src="post.fields.featuredImage.fields.file.url + '?fit=crop&h=300&f=center'"
      :srcset="`${post.fields.featuredImage.fields.file.url}?w=350&h=196&fit=fill 777w, ${post.fields.featuredImage.fields.file.url}?w=1000&h=562&fit=fill 1000w, ${post.fields.featuredImage.fields.file.url}?w=2000&h=1125&fit=fill 2000w`"
      sizes="(min-width: 1024px) 1200px, 100vw"
    />
    <h1 class="title is-2">{{ post.fields.title }}</h1>
    <hr />
    <div v-html="$md.render(post.fields.content)"></div>
  </article>
</template>

<script>
export default {
  props: ['post'],
};
</script>

<style lang="scss" scoped>
img {
  height: 300px;
}
</style>