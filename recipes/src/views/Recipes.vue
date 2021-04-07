<template lang="html">
  <div class="home-div">
    <div class="body-content">
    <div class="recipe-form">
      <div class="form">
        <input v-model="findCook" placeholder="Search for a Cook">
        <div class="suggestions" v-if="suggestions.length > 0">
          <div class="suggestion" v-for="s in suggestions" :key="s.id" @click="selectCook(s)">{{s.name}}
          </div>
        </div>
      </div>
      <input type="text" placeholder="Title" v-model="recipeTitle">
      <input type="text" placeholder="About" v-model="recipeDesc">
      <input type="file" name="photo" @change="fileChanged">
      <button @click="addRecipe">Add a Recipe</button>
    </div>

    <h1 class="list-heading" v-if="cookFound">Recipes for {{cookFound.name}}</h1>
    <h1 class="list-heading" v-if="!cookFound">Click on a cook to get started</h1>
    <div class="pure-g">
    <div class="pure-u-1 pure-u-md-1-3" v-for="recipe in recipes" :key="recipe.id">
      <img class="pure-img" :src="recipe.path" />
      <h2>{{recipe.title}}</h2>
      <p>{{recipe.desc}}</p>
      <button @click="showEdit(recipe)">Edit</button>
      <button @click="deleteRecipe(recipe)">Delete</button>
      <div class="recipe-edit" :id="recipe._id">
        <div class="recipe-form">
          <input type="text" v-model="editRecipeTitle">
          <input type="text" v-model="editRecipeDesc">
          <button @click="editRecipe(recipe)">Save</button>
        </div>
      </div>
    </div>
    </div>
  </div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'Recipes',
  data() {
    return {
      recipes: [],
      cooks: [],
      findCook: '',
      cookFound: null,
      recipeTitle: '',
      recipeDesc: '',
      file: null,
      editRecipeTitle: '',
      editRecipeDesc: '',
      currentEditID: '',
    }
  },
  created() {
    this.getRecipes();
    this.getCooks();
  },
  computed: {
    suggestions() {
      let cooks = this.cooks.filter(cook => cook.name.toLowerCase().startsWith(this.findCook.toLowerCase()));
      return cooks.sort((a, b) => a.title > b.title);
    }
  },
  methods: {
    fileChanged(event) {
      this.file = event.target.files[0]
    },
    async getCooks() {
      try {
        const response = await axios.get("/api/cooks");
        this.cooks = response.data;
        return true;
      } catch (error) {
        console.log(error);
      }
    },
    selectCook(cook) {
      this.findCook = "";
      this.cookFound = cook;
      this.getRecipes();
    },
    async addRecipe() {
      try {
        const formData = new FormData();
        formData.append('photo', this.file, this.file.name)
        let r1 = await axios.post('/api/photos', formData);
        await axios.post("/api/cooks/" + this.cookFound._id + "/recipes", {
          cook: this.cookFound,
          title: this.recipeTitle,
          desc: this.recipeDesc,
          path: r1.data.path
        });
        await this.getRecipes();
      } catch (error) {
        console.log(error);
      }
    },
    showEdit(recipe) {
      if (this.currentEditID != '') document.getElementById(this.currentEditID).style.display = "none";
      if (this.currentEditID == recipe._id) {
        document.getElementById(recipe._id).style.display = "none";
        return true;
      }
      this.currentEditID = recipe._id;
      let recipe_edit = document.getElementById(recipe._id);
      if (recipe_edit.style.display === "flex") {
        recipe_edit.style.display = "none";
      } else {
        recipe_edit.style.display = "flex";
        this.editRecipeTitle = recipe.title;
        this.editRecipeDesc = recipe.desc;
      }
    },
    async editRecipe(recipe) {
      try {
        await axios.put(`/api/cooks/${this.cookFound._id}/recipes/` + recipe._id, {
          cook: this.cookFound,
          title: this.editRecipeTitle,
          desc: this.editRecipeDesc,
          path: recipe.path
        });
        this.getRecipes();
        document.getElementById(recipe._id).style.display = "none";
        return true;
      } catch (error) {
        console.log(error);
      }
    },
    async deleteRecipe(recipe) {
      try {
        await axios.delete(`/api/cooks/${this.cookFound._id}/recipes/` + recipe._id);
        this.getRecipes();
        return true;
      } catch (error) {
        console.log(error);
      }
    },
    async getRecipes() {
      try {
        const response = await axios.get(`/api/cooks/${this.cookFound._id}/recipes`);
        this.recipes = response.data;
        return true;
      } catch (error) {
        console.log(error);
      }
    }
  }
}
</script>

<style lang="css" scoped>
.form {
  display: flex;
  flex-direction: column;
  width: 250px;
  margin-bottom: 10px;
}

.form input {
  margin-bottom: 0;
}

.suggestions {
  border-radius: 1px;
  border-style: solid;
  border-color: #2a7d49;
  text-align: left;
}

.suggestion:hover {
  background-color: #2a7d49;
  color: #fff;
}

.body-content {
  margin-left: 50px;
}

.recipe-form {
  display: flex;
  flex-direction: column;
  margin-bottom: 50px;
}

.recipe-form button, input {
  margin-bottom: 10px;
}

input {
  max-width: 250px;
}

button {
  max-width: 250px;
}

.list-heading {
  text-align: left;
  font-size: 60px;
}

.recipe {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 20px;
  width: 100%;
  height: 70px;
}

.recipe img {
  max-width: 100%;
  max-height: 100%;
}

.recipe img, h2, p {
  margin-right: 10px;
}

.recipe-edit {
  display: none;
  box-shadow: 1px 0px 25px 0px #d1d1d1;
  padding: 10px;
}
</style>
