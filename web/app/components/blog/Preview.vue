<template>
  <article v-if="post.fields">
    <nuxt-link
      :to="{ name: 'blog-slug', params: { slug: post.fields.slug } }"
      class="title"
    >
      <div class="wrap">
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
            }?w=350&h=196&fit=fill 350w, ${
              post.fields.featuredImage.fields.file.url
            }?w=1000&h=562&fit=fill 1000w, ${
              post.fields.featuredImage.fields.file.url
            }?w=2000&h=1125&fit=fill 2000w`
          "
          sizes="(min-width: 1024px) 400px, 100vw"
        />
        <div class="secondary">
          <h2 class="brand-font text-2xl pt-4">{{ post.fields.title }}</h2>
          <div class="text-sm text-gray-500">
            {{
              (post.fields.date || post.sys.createdAt) | moment("MMMM Do YYYY")
            }}
            by {{ post.fields.author }}
          </div>
          <p class="pb-8">{{ post.fields.summary }}</p>
        </div>
      </div>
    </nuxt-link>

    <div class="tags">
      <nuxt-link
        v-for="tag in post.fields.tags"
        :key="tag"
        :to="{ name: 'tags-tag', params: { tag: tag } }"
        class="tag"
        >{{ tag }}</nuxt-link
      >
    </div>
  </article>
</template>

<script>
export default {
  props: ["post"]
};
</script>

<style lang="scss" scoped>
@import "tailwindcss";
// img {
//   height: 300px;
// }
a:hover .wrap {
  opacity: 0.8;
}

.wrap {
  display: flex;
  margin-bottom: 30px;
}

.primary {
  width: 30%;
}

.secondary {
  padding-left: 30px;
}

@media (max-width: 767px) {
  .wrap {
    flex-direction: column-reverse;
  }
  .primary,
  .secondary {
    width: auto;
    padding: 0;
  }
}
</style>
