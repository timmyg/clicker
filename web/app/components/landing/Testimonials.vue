<template>
  <section class="testimonial section center-content">
    <div class="container">
      <div class="testimonial-inner section-inner">
        <!-- <div class="section-header">
          <div class="container-xs">
            <h2 class="m-0">Customer testimonials</h2>
          </div>
        </div>-->
        <div class="tiles-wrap illustration-section-04 reveal-from-top">
          <div
            class="tiles-item reveal-from-top"
            v-scroll-reveal="{ delay: 90, origin: 'top', distance: '30px' }"
          >
            <div class="tiles-item-inner has-shadow">
              <div class="testimonial-item-content">
                <p class="text-sm mb-24">
                  I am all in on Clicker. Control Center has proved to be
                  invaluable to us, as it gives me peace of mind that experts
                  are actively managing our TV sports entertainment.
                </p>
                <div class="testimonial-item-image mt-8 mb-24">
                  <img
                    src="/images/landing/testimonials/will.jpg"
                    alt="Testimonial image 02"
                    width="56"
                    height="56"
                  />
                  &nbsp;
                  <div class="h6 text-xs">Will</div>&nbsp;
                  <div class="muted h6 text-xs">Tin Roof Regional Manager</div>
                </div>
              </div>
            </div>
          </div>
          <div
            class="tiles-item reveal-from-top"
            v-scroll-reveal="{ delay: 50, origin: 'top', distance: '20px' }"
          >
            <div class="tiles-item-inner has-shadow">
              <div class="testimonial-item-content">
                <p class="text-sm mb-24">
                  Clicker TV has been a huge help to my staff. It has allowed
                  them to focus on bartending and waiting on our customers
                  without having to worry about adjusting TVs all day.
                </p>
                <div class="testimonial-item-image mt-8 mb-24">
                  <img
                    src="/images/landing/testimonials/patrick.jpeg"
                    alt="Testimonial image 02"
                    width="56"
                    height="56"
                  />
                  &nbsp;
                  <div class="h6 text-xs">Patrick</div>&nbsp;
                  <div class="muted h6 text-xs">Queen City Exchange Partner</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.tiles-wrap {
  justify-content: space-evenly;
}
</style>
