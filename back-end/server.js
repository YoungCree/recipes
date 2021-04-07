const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const multer = require("multer");
const upload = multer({
  dest: '../recipes/public/images/',
  limits: {
    fileSize: 10000000
  }
});

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

// connect to the database
mongoose.connect('mongodb://localhost:27017/recipes', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const cookSchema = new mongoose.Schema({
  name: String,
  desc: String,
  path: String
});

const Cook = mongoose.model('Cook', cookSchema);

const recipeSchema = new mongoose.Schema({
  cook: {
    type: mongoose.Schema.ObjectId,
    ref: 'Cook'
  },
  title: String,
  desc: String,
  path: String,
});

const Recipe = mongoose.model('Recipe', recipeSchema);

app.post('/api/photos', upload.single('photo'), async (req, res) => {
  if (!req.file) {
    return res.sendStatus(400);
  }
  res.send({
    path: "/images/" + req.file.filename
  });
});

// Create a Cook
app.post('/api/cooks', async (req, res) => {
  const cook = new Cook({
    name: req.body.name,
    desc: req.body.desc,
    path: req.body.path,
  });
  try {
    await cook.save();
    res.send(cook);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// Edit a Cook
app.put('/api/cooks/:cookID', async (req, res) => {
    try {
        let cook = await Cook.findOne({
          _id: req.params.cookID
        });
        cook.name = req.body.name;
        cook.desc = req.body.desc;
        cook.path = req.body.path;
        await cook.save();
        res.send(cook);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

// Delete a Cook
app.delete('/api/cooks/:cookID', async (req, res) => {
    try {
        await Cook.deleteOne({
          _id: req.params.cookID
        });
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

// Get a list of all cooks
app.get('/api/cooks', async (req, res) => {
  try {
    let cooks = await Cook.find();
    res.send(cooks);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// Create a Recipe
app.post('/api/cooks/:cookID/recipes', async (req, res) => {
    try {
        let cook = await Cook.findOne({_id: req.params.cookID});
        if (!cook) {
            res.send(404);
            return;
        }
        let recipe = new Recipe({
            cook: cook,
            title: req.body.title,
            desc: req.body.desc,
            path: req.body.path,
        });
        await recipe.save();
        res.send(recipe);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

// Get recipes from a cook
app.get('/api/cooks/:cookID/recipes', async (req, res) => {
    try {
        let cook = await Cook.findOne({_id: req.params.cookID});
        if (!cook) {
            res.send(404);
            return;
        }
        let recipes = await Recipe.find({cook:cook});
        res.send(recipes);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

// Get a list of all cooks
app.get('/api/recipes', async (req, res) => {
  try {
    let recipes = await Recipe.find();
    res.send(recipes);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// Edit a recipe
app.put('/api/cooks/:cookID/recipes/:recipeID', async (req, res) => {
    try {
        let recipe = await Recipe.findOne({_id:req.params.recipeID, cook: req.params.cookID});
        if (!recipe) {
            res.send(404);
            return;
        }
        recipe.title = req.body.title;
        recipe.desc = req.body.desc;
        recipe.path = req.body.path;
        await recipe.save();
        res.send(recipe);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

// Delete a recipe
app.delete('/api/cooks/:cookID/recipes/:recipeID', async (req, res) => {
    try {
        let recipe = await Recipe.findOne({_id:req.params.recipeID, cook: req.params.cookID});
        if (!recipe) {
            res.send(404);
            return;
        }
        await recipe.delete();
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.listen(3000, () => console.log('Server listening on port 3000!'));
