<template>
  <ul id="navigation">
    <li v-for="item in navList" v-bind:key="item.name">
      <template v-if="item.children">
        <a
          :href="item.url"
          :title="item.name"
          @click="isOpen = !isOpen, active = !active"
          :class="{ active }"
          class="brand-font"
        >
          {{ item.name }}
          <svg viewBox="0 0 451.847 451.847" width="12" class="arrow">
            <path
              d="M225.923,354.706c-8.098,0-16.195-3.092-22.369-9.263L9.27,151.157c-12.359-12.359-12.359-32.397,0-44.751
		c12.354-12.354,32.388-12.354,44.748,0l171.905,171.915l171.906-171.909c12.359-12.354,32.391-12.354,44.744,0
		c12.365,12.354,12.365,32.392,0,44.751L248.292,345.449C242.115,351.621,234.018,354.706,225.923,354.706z"
              fill="#0091ea"
            />
          </svg>
        </a>
        <div :class="{ isOpen }" class="dropdown">
          <ul>
            <li v-for="{ url, name, index, target } in item.children" :key="index">
              <a :href="url" :title="name" :target="target" class="brand-font">{{ name }}</a>
            </li>
          </ul>
        </div>
      </template>
      <template v-else>
        <a :href="item.url" :title="item.name">{{ item.name }}</a>
      </template>
    </li>
  </ul>
</template>

<script>
export default {
  props: ["item"],
  data() {
    return {
      isOpen: false,
      active: false,
      navList: [
        {
          // url: "#",
          name: "Products",
          children: [
            {
              url: "/clicker-tv/staff",
              name: "Clicker TV for Staff",
            },
            {
              url: "/clicker-tv/guests",
              name: "Clicker TV for Guests",
            },
            {
              url: "/control-center",
              name: "Control Center",
            }
          ]
        },
      ]
    };
  }
}
</script>

<style lang="scss" scoped>
@import url("https://fonts.googleapis.com/css?family=Raleway&display=swap");

$black: #212529;
$white: #ffffff;

$col1: #9f1414;
$col2: #dc3545;

$primary: #0091ea;

*,
::before,
::after {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

@mixin flex($fd: row, $jc: center, $ai: center) {
  display: flex;
  flex-direction: $fd;
  justify-content: $jc;
  align-items: $ai;
}

ul {
  list-style-type: none;
  li {
    position: relative;
    margin: 0.25em;
    text-align: center;

    a {
      display: block;
      padding: 0.55em 1em;
      text-decoration: none;
      color: $primary;
      text-align: left;

      &:hover {
        font-weight: bold;
        cursor: pointer;
      }
    }
  }

  &#navigation {
    @include flex($ai: flex-start);
    // margin-top: 16px;
  }
}

.dropdown {
  position: absolute;
  left: 50%;
  transform: translatex(-50%) rotatex(90deg) scale(0);
  margin-top: 0.55em;
  transform-origin: top right;
  border-radius: 0.35em;
  background-color: rgba($black, 0.15);
  visibility: hidden;
  opacity: 0;
  transition: all 200ms linear;
  width: 240px;
  left: 0px;
  background: white;
  border: 1px solid $primary;
  font-size: 18px;
  text-align: left;

  &.isOpen {
    transform: translatex(-50%);
    visibility: visible;
    opacity: 1;
  }
}

body {
  position: relative;
  overflow: hidden;
  padding-top: 4em;
  padding-bottom: 4em;
  min-height: 100vh;
  font: {
    family: "Raleway", sans-serif;
    size: 16px;
    weight: 500;
  }
  line-height: 1.5;
  @include flex($ai: flex-start);
  color: currentcolor;
  background: radial-gradient($col2 6%, transparent 6%), darken($col1, 2%);
  background-position: 0 0, 5px 5px;
  background-size: 5px 5px;

  &::before {
    position: absolute;
    content: "😍";
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: $white;
    opacity: 0.1;
    font-size: 30vw;
    animation: emoji 20s linear 3s infinite;
  }
}

@keyframes emoji {
  1% {
    content: "😍";
  }
  2% {
    content: "😙";
  }
  3% {
    content: "😌";
  }
  4% {
    content: "😋";
  }
  5% {
    content: "😉";
  }
  6% {
    content: "😁";
  }
  7% {
    content: "😜";
  }
  8% {
    content: "😍";
  }
  9% {
    content: "😝";
  }
  10% {
    content: "😊";
  }
  11%,
  100% {
    content: "";
  }
}
.arrow {
  float: right;
  margin-left: 10px;
  margin-top: 10px;
}
</style>