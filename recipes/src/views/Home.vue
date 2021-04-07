<template lang="html">
<div class="home-div">
  <div class="body-content">
  <div class="cook-form">
    <input type="text" placeholder="Name" v-model="cookName">
    <input type="text" placeholder="About" v-model="cookDesc">
    <input type="file" name="photo" @change="fileChanged">
    <button @click="addCook">Add a Cook</button>
  </div>

  <h1 class="list-heading">Cooks</h1>
  <div class="pure-g">
  <div class="pure-u-1 pure-u-md-1-3" v-for="cook in cooks" :key="cook.id">
    <img class="pure-img" :src="cook.path" />
    <h2>{{cook.name}}</h2>
    <p>{{cook.desc}}</p>
    <button @click="showEdit(cook)">Edit</button>
    <button @click="deleteCook(cook)">Delete</button>
    <div class="cook-edit" :id="cook._id">
      <div class="cook-form">
        <input type="text" v-model="editCookName">
        <input type="text" v-model="editCookDesc">
        <button @click="editCook(cook)">Save</button>
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
  name: 'Home',
  data() {
    return {
      cooks: [],
      cookName: '',
      cookDesc: '',
      file: null,
      editCookName: '',
      editCookDesc: '',
      currentEditID: '',
    }
  },
  created() {
    this.getCooks();
  },
  methods: {
    fileChanged(event) {
      this.file = event.target.files[0]
    },
    async addCook() {
      try {
        const formData = new FormData();
        formData.append('photo', this.file, this.file.name)
        let r1 = await axios.post('/api/photos', formData);
        await axios.post("/api/cooks", {
          name: this.cookName,
          desc: this.cookDesc,
          path: r1.data.path
        });
        await this.getCooks();
      } catch (error) {
        console.log(error);
      }
    },
    showEdit(cook) {
      if (this.currentEditID != '') document.getElementById(this.currentEditID).style.display = "none";
      if (this.currentEditID == cook._id) {
        document.getElementById(cook._id).style.display = "none";
        return true;
      }
      this.currentEditID = cook._id;
      let cook_edit = document.getElementById(cook._id);
      if (cook_edit.style.display === "flex") {
        cook_edit.style.display = "none";
      } else {
        cook_edit.style.display = "flex";
        this.editCookName = cook.name;
        this.editCookDesc = cook.desc;
      }
    },
    async editCook(cook) {
      try {
        await axios.put("/api/cooks/" + cook._id, {
          name: this.editCookName,
          desc: this.editCookDesc,
          path: cook.path
        });
        this.getCooks();
        document.getElementById(cook._id).style.display = "none";
        return true;
      } catch (error) {
        console.log(error);
      }
    },
    async deleteCook(cook) {
      try {
        await axios.delete("/api/cooks/" + cook._id);
        this.getCooks();
        return true;
      } catch (error) {
        console.log(error);
      }
    },
    async getCooks() {
      try {
        const response = await axios.get("/api/cooks");
        this.cooks = response.data;
        return true;
      } catch (error) {
        console.log(error);
      }
    }
  }
}
</script>

<style lang="css" scoped>
.body-content {
  margin-left: 15px;
}

.cook-form {
  display: flex;
  flex-direction: column;
  margin-bottom: 50px;
}

.cook-form button, input {
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

.cook {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 20px;
  width: 100%;
  height: 70px;
}

.cook img {
  max-width: 100%;
  max-height: 100%;
}

.cook img, h2, p {
  margin-right: 10px;
}

.cook-edit {
  display: none;
  box-shadow: 1px 0px 25px 0px #d1d1d1;
  padding: 10px;
}
</style>
