<template>
  <section class="announcements section center-content">
    <div class="container brand-font">
      <div
        v-for="announcement in activeAnnouncements"
        :key="announcement.text"
        class="announcement"
      >
        <span v-html="announcement.text" class="text"></span>
      </div>
    </div>
  </section>
</template>

<script>
import * as moment from "moment";
export default {
  data: () => ({
    allAnnouncements: [
      // {
      //   text: "8/18/20: Clicker just launched to the public!",
      //   start: moment("2020-8-10", "YYYY-M-D"),
      //   end: moment("2020-9-28", "YYYY-M-D")
      // }
    ]
  }),
  computed: {
    activeAnnouncements() {
      return this.allAnnouncements.filter(a =>
        moment().isBetween(a.start, a.end)
      );
    }
  }
};
</script>

<style lang="scss" scoped>
.announcements {
  position: relative;
  background: white;
}
.text {
  border: 5px solid;
  border-image-source: url(https://clicker-brand.s3.amazonaws.com/checkerboard.png);
  border-image-slice: 15 45;
  border-image-repeat: repeat;
  border-top: 0;
  border-right: 0;
  border-left: 0;
}
</style>
