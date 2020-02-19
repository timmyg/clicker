<template>
  <section
    class="w-full lg:w-1/2 bg-gray-300 h-48 flex flex-wrap content-center justify-center"
  >
    <!-- <span class="text-3xl">{{ channel }}</span> -->
    <!-- <div>boxId: {{ boxId }}</div> -->
    <!-- <div>label: {{ label }}</div> -->
    <video width="1600" height="900" autoplay loop>
      <source
        src="https://clicker-demo.s3.amazonaws.com/kobe.mp4"
        type="video/mp4"
      />
      <!-- <source src="movie.ogg" type="video/ogg" /> -->
      Your browser does not support the video tag.
    </video>
  </section>
</template>

<script>
export default {
  props: ["channel", "boxId", "label"]
};
</script>

<style lang="scss" scoped>
@import "tailwindcss";
</style>
