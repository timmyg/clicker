<template>
  <div>
    <img :src="img" />
    <img :src="img1" class="hide" />
    <img :src="img2" class="hide" />
  </div>
</template>

<script>
export default {
    props: ['img1', 'img2'],
      data: function() {
        return {
            img: null
        };
    },
    created: function() {
        const self = this;
        self.img = self.img1;
        const img2 = self.img2
		setInterval(function() {
            self.img = self.img === self.img1 ? self.img2 : self.img1;
        }, 3000);
    }
}
</script>

<style lang="scss" scoped>
// img {
//   position: absolute;
// }
// img:first-of-type {
// }
.hide {
  display: none;
}
</style>