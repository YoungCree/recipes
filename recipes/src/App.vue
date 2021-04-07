<template>
  <div id="app">

    <div class="pure-menu pure-menu-horizontal">
      <a href="#" class="pure-menu-heading pure-menu-link">Web Kitchen</a>
      <ul class="pure-menu-list">
          <li class="pure-menu-item">
              <a href="/" class="pure-menu-link">Cooks</a>
          </li>
          <li class="pure-menu-item">
              <a href="/recipes" class="pure-menu-link">Recipes</a>
          </li>
      </ul>
    </div>

    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.pure-menu {
  margin-bottom: 100px !important;
  padding-top: 30px !important;
  background-color: #2a7d49 !important;
}

.pure-menu-link {
  color: white !important;
}

.pure-menu-link:hover {
  background-color: black !important;
}
</style>
