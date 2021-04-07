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
    <div class="footer" id="footer">
    <a href="https://github.com/YoungCree/recipes">
      <img class="footer-img" src="/images/github.png" alt="">
    </a>
  </div>
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

.footer {
  display: flex;
  justify-content: center;
  width: 100%;
  padding-top: 50px;
  padding-bottom: 30px;
  margin-top: 50px;
  position: relative;
  bottom: 0;
  background-color: #e6e6e6;
}

.footer-img-link {
  width: 30px;
}

.footer-img {
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 30px;
  height: 30px;
}
</style>
