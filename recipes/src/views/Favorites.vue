<template lang="html">
  <div class="home-div">
    <div v-if="user" class="body-content">
      <h1 class="list-heading">{{user.firstName}}'s Favorites</h1>
      <button class="button-error pure-button" @click="logout">Logout</button>
      <div class="pure-g">
        <div class="pure-u-1 pure-u-md-1-3" v-for="recipe in recipes" :key="recipe.id">
          <img class="pure-img" :src="recipe.path" />
          <h2>{{recipe.title}}</h2>
          <p>{{recipe.desc}}</p>
          <button @click="removeFavorite(recipe)">Remove</button>
        </div>
      </div>
    </div>
    <Login v-else />
  </div>
</template>

<script>
import Login from '@/components/Login.vue';
import axios from 'axios';
export default {
  name: 'Favorites',
  components: {
    Login,
  },
  data() {
    return {
      recipes: [],
    }
  },
  async created() {
    try {
      let response = await axios.get('/api/users');
      this.$root.$data.user = response.data.user;
    } catch (error) {
      this.recipes = null;
      this.$root.$data.user = null;
    }
    this.getRecipes();
  },
  computed: {
    user() {
      if (this.$root.$data.user != null) this.getRecipes();
      return this.$root.$data.user;
    },
  },
  methods: {
    async logout() {
      try {
        await axios.delete("/api/users");
        this.$root.$data.user = null;
        this.recipes = null;
      } catch (error) {
        this.$root.$data.user = null;
      }
    },
    async getRecipes() {
      try {
        const response = await axios.get(`/api/users/recipes`);
        this.recipes = response.data;
        return true;
      } catch (error) {
        console.log(error);
      }
    },
    async removeFavorite(recipe) {
      try {
        await axios.delete("/api/users/remove/" + recipe._id);
        this.getRecipes();
        return true;
      } catch (error) {
        console.log(error);
      }
    }
  }
}
</script>

<style media="screen">
  .button-error {
    color: white !important;
    margin-bottom: 50px;
    border-radius: 4px;
    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
    background: rgb(202, 60, 60) !important;
  }
</style>
