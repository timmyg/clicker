<template>
  <!-- <layout-basic> -->
  <!-- <Header v-bind:subtitle="'Demo'" v-bind:link="'/blog'"></Header> -->
  <main>
    <div class="container">
      <div class="flex flex-wrap mb-4">
        <DemoTV
          v-for="tv in tvs"
          :key="tv.boxId"
          v-bind:channel="tv.channel"
          v-bind:boxId="tv.boxId"
          v-bind:label="tv.label"
        />
      </div>
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
      { boxId: 1, label: "1", channel: 201 },
      { boxId: 2, label: "2", channel: 202 },
      { boxId: 3, label: "3", channel: 203 },
      { boxId: 4, label: "4", channel: 204 }
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
        console.log("child_added only new");
        console.log(child_added.val());
        // this.tvs
        const newTv = child_added.val();
        const i = this.tvs.findIndex(tv => tv.boxId == newTv.boxId);
        console.log({ i });
        this.tvs[i].channel = newTv.channel;
      });
  }
};
</script>

<style lang="scss" scoped>
@import "tailwindcss";
</style>
