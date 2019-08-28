<template>
  <div class="container">
    <div class="columns">
      <div class="column is-offset-2 is-8">
        <p class="subtitle is-6">
          <nuxt-link :to="{name :'blog'}">Back to Blog home</nuxt-link>
        </p>
        <h1 class="title is-2">{{ $route.params.post.title }}</h1>
        <hr />
        <div class="content">{{$route.params.post.content}}</div>
      </div>
    </div>
  </div>
</template>