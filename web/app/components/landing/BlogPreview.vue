<template>
  <div>
    hello!
    <div class="container mb-64" v-if="latestPost">{{latestPost.fields.title}}</div>
  </div>
</template>

<script>
export default {
  props: ["posts"],
  computed: {
    latestPost: function() {
      return this.posts[0];
    }
  }
};
</script>
