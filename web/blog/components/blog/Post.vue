<template>
  <article>
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