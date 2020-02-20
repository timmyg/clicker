<template>
  <section
    class="w-full lg:w-1/2 bg-gray-300 h-48 flex flex-wrap content-center justify-center"
  >
    <!-- <span class="text-3xl">{{ channel }}</span> -->
    <!-- <div>boxId: {{ boxId }}</div> -->
    <!-- <div>label: {{ label }}</div> -->
    <video :id="boxId" width="800" height="450" autoplay loop muted>
      <source :src="getVideo(channel)" type="video/mp4" />
      <!-- <source src="movie.ogg" type="video/ogg" /> -->
      Your browser does not support the video tag.
    </video>
  </section>
</template>

<script>
const programs = [
  { channel: 206, link: "https://clicker-demo.s3.amazonaws.com/gameday.mp4" },
  {
    channel: 220,
    link: "https://clicker-demo.s3.amazonaws.com/premier-league.mp4"
  },
  { channel: 219, link: "https://clicker-demo.s3.amazonaws.com/xavier-uc.mp4" },
  { channel: 209, link: "https://clicker-demo.s3.amazonaws.com/unc-duke.mp4" },
  {
    channel: 19,
    link: "https://clicker-demo.s3.amazonaws.com/ohio-state-clemson.mp4"
  },
  {
    channel: 612,
    link: "https://clicker-demo.s3.amazonaws.com/louisville-texas-tech.mp4"
  },
  { channel: 9, link: "https://clicker-demo.s3.amazonaws.com/xfl.mp4" },
  {
    channel: 64,
    link: "https://clicker-demo.s3.amazonaws.com/fc-cincinnati.mp4"
  },
  {
    channel: 208,
    link: "https://clicker-demo.s3.amazonaws.com/florida-state-wake.mp4"
  },
  { channel: 618, link: "https://clicker-demo.s3.amazonaws.com/kobe.mp4" },
  { channel: 5, link: "https://clicker-demo.s3.amazonaws.com/notre-dame.mp4" },
  { channel: 245, link: "https://clicker-demo.s3.amazonaws.com/wwe.mp4" },
  { channel: 218, link: "https://clicker-demo.s3.amazonaws.com/golf.mp4" },
  { channel: 661, link: "https://clicker-demo.s3.amazonaws.com/reds.mp4" },
  { channel: 612, link: "https://clicker-demo.s3.amazonaws.com/mma.mp4" }
];
export default {
  props: ["channel", "boxId", "label"],
  methods: {
    getVideo(channel) {
      const program = programs.find(p => p.channel === channel);
      console.log({ program });
      if (program) {
        return program.link;
      }
      return programs[0].link;
    }
  }
};
</script>

<style lang="scss" scoped>
@import "tailwindcss";
</style>
