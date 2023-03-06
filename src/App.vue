<template>
  <div class="container">
    <div id="app">
      <RawPublisher />
      <HelloWorld />
    </div>
  </div>
</template>

<script>
import HelloWorld from "./components/HelloWorld.vue";
import RawPublisher from "./components/RawPublisher.vue";

export default {
  name: "App",
  components: {
    HelloWorld,
    RawPublisher,
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

</style>
