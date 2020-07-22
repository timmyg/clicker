<template>
  <layout-basic>
    <Header v-bind:subtitle="'Setup'" />
    <section class="main container">
      <h2>Setting up your Clicker device</h2>

      <p>There are a few things you'll need to do in order to make sure your DIRECTV and internet network setup is ready for Clicker</p>

      <h4>🌐 Hook up your DIRECTV boxes to internet</h4>
      <p>Each of your DIRECTV boxes will need to be hooked into your internet network with an ethernet cable. After doing this, reset your boxes</p>

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

      <h4>🚢 Open up ports in network configuration, if necessary</h4>
      <p>
        Our device connects to a broker via the
        <a
          href="https://docs.losant.com/mqtt/overview/#the-losant-message-broker"
        >MQTT</a> protocol with a service called
        <a href="https://losant.com=">Losant</a> via the following address:
        <em>mqtts://broker.losant.com:8883</em>. If you are on a secure network that might block certain traffic, you'll want to check the following:
      </p>
      <ul class="styled">
        <li class="styled">Make sure TLS port 8883 is open</li>
        <li class="styled">Make sure address is reachable from your network</li>
      </ul>

      <h4>🗜️ Assemble your Clicker device</h4>
      <ul class="styled">
        <li class="styled">Plug the ethernet cord in to a network router and into the Clicker device</li>
        <li
          class="styled"
        >Plug the usb cord into a power source (can be an open port on DIRECTV box) and into the Clicker device</li>
      </ul>

      <h4>
        🛎️
        Lastly, contact Clicker
        <a href="https://tryclicker.com/support">here</a> so we can activate your location
      </h4>
      <p>We can also answer any questions you may have and talk through which TVs you want set up on Clicker</p>

      <br />
      <br />
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