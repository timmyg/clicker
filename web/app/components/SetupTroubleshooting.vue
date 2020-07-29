<template>
  <layout-basic>
    <Header v-bind:subtitle="'Troubleshooting'" />
    <section class="main container">
      <h2>Troubleshooting your Clicker device</h2>

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