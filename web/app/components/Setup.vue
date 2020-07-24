<template>
  <layout-basic>
    <Header v-bind:subtitle="'Setup'" />
    <section class="main container">
      <h2>Setting up your Clicker device</h2>

      <p>There are a few things you'll need to do in order to make sure your DIRECTV and internet network setup is ready for Clicker</p>
      <br />
      <h4>🌐 Hook up your DIRECTV boxes to internet</h4>
      <p>Each of your DIRECTV boxes will need to be hooked into your internet network with an ethernet cable. After doing this, reset your boxes</p>
      <br />
      <h4>🛠️ Allow Clicker access to access and read your channels</h4>
      <p>
        You must perform the following steps (or watch
        <a
          href="https://www.youtube.com/watch?v=evAuFBDZffs"
        >this video</a> for a walkthrough) on
        <b>every</b> DIRECTV box.
      </p>
      <ul class="styled">
        <li class="styled">Menu > Settings & Help > Settings > Whole-Home > External Device</li>
        <li class="styled">
          change
          <b>External Access</b> to
          <b>Allow</b>
        </li>
        <li class="styled">
          change
          <b>Current Program</b> to
          <b>Allow</b>
        </li>
      </ul>
      <br />

      <h4>🗜️ Assemble your Clicker device</h4>
      <ul class="styled">
        <li class="styled">Plug the ethernet cord in to a network router and into the Clicker device</li>
        <li
          class="styled"
        >Plug the usb cord into a power source (can be an open port on DIRECTV box) and into the Clicker device</li>
      </ul>
      <br />

      <h4>
        🛎️
        Lastly, contact Clicker
        <a href="/support">here</a> so we can activate your location
      </h4>
      <p>We can also answer any questions you may have and talk through which TVs you want set up on Clicker</p>

      <br />
      <br />
      <p>
        Having trouble? See our
        <a href="/setup/troubleshooting">troubleshooting guide</a>
      </p>
      <br />
      <br />
      <br />
    </section>
  </layout-basic>
</template>

<script>
import Header from "@/components/layouts/Header";
import LayoutBasic from "@/components/layouts/Basic";

export default {
  components: {
    Header,
  },
}
 </script>

 <style lang="scss">
// @import "tailwindcss/base";
// @import "tailwindcss/components";
// @import "tailwindcss/utilities";

section.main {
  padding-top: 100px;
}
</style>