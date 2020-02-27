<template>
  <section class="wrapper w-full lg:w-1/2 flex flex-wrap content-center justify-center">
    <div class="tv-wrapper">
      <video v-bind:class="{ hidden: !isChanging }" id="static" autoplay loop muted>
        <source src="https://clicker-demo.s3.amazonaws.com/static.mp4" type="video/mp4" />
      </video>
      <video v-bind:class="{ hidden: isChanging }" :id="boxId" autoplay loop muted :key="channel">
        <source :src="getVideo(channel)" type="video/mp4" />
      </video>
      <div class="tv-label">TV {{ label }}</div>
    </div>
  </section>
</template>

<script>
export default {
  props: ["channel", "boxId", "label", "allPrograms"],
  data: function() {
    return {
      isChanging: false
    };
  },
  watch: {
    channel: function(newVal, oldVal) {
      // watch it
      console.log("channel changed: ", newVal, " | was: ", oldVal);
      this.isChanging = true;
      setTimeout(() => (this.isChanging = false), 1000);
    }
  },
  methods: {
    getVideo(channel) {
      console.log({ channel });
      console.log(this.allPrograms);
      const program = this.allPrograms.find(p => p.channel === channel);
      return program.link;
    }
  }
};
</script>

<style lang="scss" scoped>
@import "tailwindcss";
video {
  right: 0;
  bottom: 0;
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  // opacity: 0.3;
}
.wrapper {
  height: 50vh;
  padding: 30px;
  height: 80%;
}
.tv-wrapper {
  border: 14px solid black;
  border-radius: 5px;
  position: relative;
}
.tv-label {
  font-family: "Saira", sans-serif;
  position: absolute;
  // right: -10px;
  // bottom: -10px;
  right: calc(50% - 2rem);
  bottom: -2.5rem;
  background: white;
  width: 4rem;
  height: 2rem;
  text-align: center;
  border-radius: 3px;
}
</style>
