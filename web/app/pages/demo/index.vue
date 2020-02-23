<template>
  <!-- <layout-basic> -->
  <!-- <Header v-bind:subtitle="'Demo'" v-bind:link="'/blog'"></Header> -->
  <main>
    <div class="container">
      <div class="sign">
        <img src="/images/demo/sign.png" />
      </div>
      <div class="flex flex-wrap mb-4">
        <DemoTV
          v-for="tv in tvs"
          :key="tv.boxId"
          v-bind:allPrograms="allPrograms"
          v-bind:channel="tv.channel"
          v-bind:boxId="tv.boxId"
          v-bind:label="tv.label"
        />
      </div>
    </div>
    <div class="hidden">
      <link v-for="program in allPrograms" :key="program.link" :href="program.link" rel="preload" />
    </div>
  </main>
</template>

<script>
import firebase from "firebase/app";
import "firebase/database";
const zapsRefName = `zaps-${process.env.NUXT_ENV_STAGE}`;
import DemoTV from "@/components/DemoTV";

export default {
  data: () => ({
    tvs: [
      { boxId: 1, label: "1", channel: 206 },
      { boxId: 2, label: "2", channel: 220 },
      { boxId: 3, label: "3", channel: 218 },
      { boxId: 4, label: "4", channel: 219 }
    ],
    allPrograms: [
      {
        channel: 206,
        link: "https://clicker-demo.s3.amazonaws.com/gameday.mp4"
      },
      {
        channel: 220,
        link: "https://clicker-demo.s3.amazonaws.com/premier-league.mp4"
      },
      {
        channel: 219,
        link: "https://clicker-demo.s3.amazonaws.com/xavier-uc.mp4"
      },
      {
        channel: 209,
        link: "https://clicker-demo.s3.amazonaws.com/unc-duke.mp4"
      },
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
      {
        channel: 5,
        link: "https://clicker-demo.s3.amazonaws.com/notre-dame.mp4"
      },
      { channel: 245, link: "https://clicker-demo.s3.amazonaws.com/wwe.mp4" },
      { channel: 218, link: "https://clicker-demo.s3.amazonaws.com/golf.mp4" },
      { channel: 661, link: "https://clicker-demo.s3.amazonaws.com/reds.mp4" },
      { channel: 612, link: "https://clicker-demo.s3.amazonaws.com/mma.mp4" }
    ]
  }),
  components: { DemoTV },
  async mounted() {
    if (!firebase.apps.length) {
      const config = {
        apiKey: "AIzaSyAPdo-yLm5jCzCwI8A0eJsifXofZHANnpo",
        authDomain: "clicker-1577130258869.firebaseapp.com",
        databaseURL: "https://clicker-1577130258869.firebaseio.com",
        projectId: "clicker-1577130258869",
        storageBucket: "clicker-1577130258869.appspot.com",
        messagingSenderId: "114978862752",
        appId: "1:114978862752:web:ea19ead12d703e012d7bc5"
      };
      firebase.initializeApp(config);
    }
    const db = firebase.database();
    const ref = db.ref(zapsRefName);
    db.ref(zapsRefName)
      .orderByChild("timestamp")
      .startAt(Date.now())
      .on("child_added", child_added => {
        console.log(child_added.val());
        const newTv = child_added.val();
        const i = this.tvs.findIndex(tv => tv.boxId == newTv.boxId);
        this.tvs[i].channel = newTv.channel;
      });
  }
};
</script>

<style lang="scss" scoped>
@import "tailwindcss";
@import url("https://fonts.googleapis.com/css?family=Saira&display=swap");
main {
  background-image: url("/images/demo/wood-1.jpg");
  background-size: 200px;
  background-repeat: repeat;
  // height: 100vh;
  height: 100vh;
}
.sign {
  width: 60%;
  margin: 0 auto;
  padding-top: 1%;
  border-radius: 10px;
}
</style>
