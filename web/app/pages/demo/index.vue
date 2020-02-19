<template>
  <!-- <layout-basic> -->
  <!-- <Header v-bind:subtitle="'Demo'" v-bind:link="'/blog'"></Header> -->
  <main>
    <div class="container">
      <h3>Zaps:</h3>
      <span v-for="zap in zaps" class="zap" :key="zap['.key']">
        <span>{{ zap.channel }}</span
        ><br />
      </span>
    </div>
  </main>
  <!-- </layout-basic> -->
</template>

<script>
import firebase from "firebase/app";
import "firebase/database";
const zapsRefName = `zaps-${process.env.NUXT_ENV_STAGE}`;

export default {
  data: () => ({ zaps: [] }),
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
      });
  }
};
</script>

<style lang="scss" scoped>
@import "tailwindcss";
</style>
