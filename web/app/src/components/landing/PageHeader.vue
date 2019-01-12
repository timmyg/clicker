<template>
  <div class="container">
    <div class="site-header-inner">
      <div class="brand header-brand">
        <h1 class="m-0">
          <a href="#">
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <title>Ava</title>
              <defs>
                <linearGradient x1="100%" y1="0%" x2="0%" y2="100%" id="logo-gradient-b">
                  <stop stop-color="#39D8C8" offset="0%"></stop>
                  <stop stop-color="#BCE4F4" offset="47.211%"></stop>
                  <stop stop-color="#838DEA" offset="100%"></stop>
                </linearGradient>
                <path
                  d="M32 16H16v16H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h28a2 2 0 0 1 2 2v14z"
                  id="logo-gradient-a"
                ></path>
                <linearGradient x1="23.065%" y1="25.446%" y2="100%" id="logo-gradient-c">
                  <stop stop-color="#1274ED" stop-opacity="0" offset="0%"></stop>
                  <stop stop-color="#1274ED" offset="100%"></stop>
                </linearGradient>
              </defs>
              <g fill="none" fill-rule="evenodd">
                <mask id="logo-gradient-d" fill="#fff">
                  <use xlink:href="#logo-gradient-a"></use>
                </mask>
                <use fill="url(#logo-gradient-b)" xlink:href="#logo-gradient-a"></use>
                <path
                  fill="url(#logo-gradient-c)"
                  mask="url(#logo-gradient-d)"
                  d="M-16-16h32v32h-32z"
                ></path>
              </g>
            </svg>
          </a>
        </h1>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PageHeader',
};
</script>

