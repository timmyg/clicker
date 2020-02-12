<template>
  <article>
    <!-- <div class="img-wrapper"> -->
    <img
      v-if="post.fields.featuredImage"
      :src="post.fields.featuredImage.fields.file.url + '?fit=fill&w=1500&h=450&f=center'"
    />
    <!-- </div> -->
    <h1 class="title is-2">{{ post.fields.title }}</h1>
    <h5 class="date">{{(post.fields.date || post.sys.createdAt) | moment('MMMM Do YYYY')}}</h5>
    <hr />
    <div v-html="$md.render(post.fields.content)"></div>
  </article>
</template>

<script>
export default {
  props: ["post"]
};
</script>

<style lang="scss" scoped>
// .img-wrapper {
//   img {
//     height: 300px;
//   }
// }
</style>
