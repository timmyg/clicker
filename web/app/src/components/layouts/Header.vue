<template>
  <header class="site-header">
    <div class="container">
      <div class="site-header-inner">
        <div class="brand">
          <h1 class="m-0">
            <a href="./">
              <!-- <img src="./dist/images/logo.svg" alt="Twist" width="32" height="32" /> -->
              <img
                src="https://clicker-brand.s3.amazonaws.com/logo.png"
                width="150"
                alt="Clicker logo"
              />
            </a>
          </h1>
        </div>
        <button
          id="header-nav-toggle"
          class="header-nav-toggle"
          aria-controls="primary-menu"
          aria-expanded="false"
        >
          <span class="screen-reader">Menu</span>
          <span class="hamburger">
            <span class="hamburger-inner"></span>
          </span>
        </button>
        <nav id="header-nav" class="header-nav">
          <div class="header-nav-inner">
            <ul class="list-reset text-xxs header-nav-right">
              <li>
                <a href="./additional.html">Secondary page</a>
              </li>
            </ul>
            <ul class="list-reset header-nav-right">
              <li>
                <a class="button button-primary button-sm" href="./signup.html">Sign up</a>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
// Header (core/layout/_header.scss)

// Background color
$header--bg: (
  header: null,
  menu-mobile: darken(get-color(dark, 1), 3%),
);

// More header settings
$header-height__mobile: 80px; // header height (mobile)
$header-height__desktop: null; // header height (desktop)
$header-nav--padding-h: 32px; // horizontal padding between header links (desktop)
$header-nav--padding-v__mobile: 24px; // vertical padding between header links (mobile)
$header-hamburger--size: 24px; // hamburger button, width and height
$header-hamburger--thickness: 2px; // hamburger button, stroke width
$header-hamburger--radius: null; // hamburger button, lines radius cap
$header-hamburger--distance: 7px; // hamburger button, top and bottom lines distance from center

// Don't change line below!
$bg--color: map-push($bg--color, $header--bg);

.site-header {
  position: absolute !important;
  top: 0;
  width: 100%;
  z-index: 10;
  background: color-bg(header);

  + .site-content {
    .section:first-of-type {
      padding-top: $header-height__mobile;
    }
  }

  .brand {
    margin-right: $header-nav--padding-h;
  }
}

.site-header-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: $header-height__mobile;
}

.header-nav {
  flex-grow: 1;

  .header-nav-inner {
    display: flex;
    flex-grow: 1;
  }

  ul {
    display: flex;
    align-items: center;
    flex-grow: 1;
    white-space: nowrap;
    margin-bottom: 0;

    &:first-of-type {
      flex-wrap: wrap;
    }
  }

  li {
    + .header-button {
      margin-left: $header-nav--padding-h;
    }
  }

  a:not(.button) {
    display: block;
    @include anchor-aspect(header);
    @include font-weight(header-link);
    text-transform: $link-header--transform;
    padding: 0 $header-nav--padding-h;

    .invert-color & {
      @include anchor-aspect(header, inverse);
    }
  }

  a.button {
    margin-left: $header-nav--padding-h;
  }
}

.header-nav-center:first-of-type {
  flex-grow: 1;
  justify-content: flex-end;
}

.header-nav-right {
  justify-content: flex-end;

  + .header-nav-right {
    flex-grow: 0;
  }
}

.header-nav-toggle {
  display: none;
}

@include media('<=medium') {
  .header-nav-toggle {
    display: block;

    // Header navigation when the hamburger is a previous sibling
    + .header-nav {
      flex-direction: column;
      position: absolute;
      left: 0;
      right: 0;
      top: 100%;
      z-index: 9999;
      background: color-bg(menu-mobile);
      max-height: 0;
      opacity: 0;
      overflow: hidden;
      transition: max-height 0.25s ease-in-out, opacity 0.15s;

      &.is-active {
        opacity: 1;
      }

      .header-nav-inner {
        flex-direction: column;
        padding: $header-nav--padding-v__mobile;
      }

      ul {
        display: block;
        text-align: center;

        a:not(.button) {
          display: inline-flex;
          @include anchor-aspect(header-mobile);
          padding-top: $header-nav--padding-v__mobile / 2;
          padding-bottom: $header-nav--padding-v__mobile / 2;
        }
      }

      a.button {
        margin-left: 0;
        margin-top: $header-nav--padding-v__mobile / 2;
        margin-bottom: $header-nav--padding-v__mobile / 2;
      }
    }
  }
}

@include media('>medium') {
  .site-header {
    + .site-content {
      .section:first-of-type {
        padding-top: $header-height__desktop;
      }
    }
  }

  .site-header-inner {
    height: $header-height__desktop;
  }
}
</style>
