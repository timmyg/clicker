<template>
  <!-- <layout-basic> -->
  <!-- <Header v-bind:subtitle="'Demo'" v-bind:link="'/blog'"></Header> -->
  <main>
    <div class="container">
      {{ users }}
      <h3>Demo...</h3>
      <span v-for="user in users" class="user" :key="user['.key']">
        <span>{{ user.name }} - {{ user.email }}</span>
      </span>
    </div>
  </main>
  <!-- </layout-basic> -->
</template>

<script>
// import * as firebase from "firebase/app";
// import "firebase/database";
// import "vuefire";
import firebase from "firebase/app";
import "firebase/database";

export default {
  // firebase: {
  //   users: usersRef
  // },
  data: () => ({ users: [] }),
  mounted() {
    if (!firebase.apps.length) {
      var config = {
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
    console.log({ firebase });
    const db = firebase.database();

    console.log("mounted");
    const ref = db.ref("users");
    console.log({ ref });
    ref.push({ email: "3@lkjdsf.com", name: "324234" });
    db.ref("users").on("value", value => {
      console.log({ value });
      this.users = value.val();
    });
    db.ref("users").on("child_added", child_added => {
      console.log({ child_added });
      console.log(child_added.val());
    });
  }
};
</script>

<style lang="scss" scoped>
@import "tailwindcss";
</style>
