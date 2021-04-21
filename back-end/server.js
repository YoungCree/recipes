const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const argon2 = require("argon2");
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

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: [
    'secretValue'
  ],
  cookie: {
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

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

// Get a list of all recipes
app.get('/api/recipes', async (req, res) => {
  try {
    let recipes = await Recipe.find();
    res.send(recipes);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// Get recipe by id
app.get('/api/recipes/:recipeID', async (req, res) => {
  try {
    let recipe = await Recipe.findOne({_id:req.params.recipeID});
    if (!recipe) {
      res.send(400);
      return;
    }
    res.send(recipe);
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

//
// User schema and model
//

// This is the schema. Users have usernames and passwords. We solemnly promise to
// salt and hash the password!
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  username: String,
  password: String,
  recipes: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Recipe'
    }
  ],
});

// This is a hook that will be called before a user record is saved,
// allowing us to be sure to salt and hash the password first.
userSchema.pre('save', async function(next) {
  // only hash the password if it has been modified (or is new)
  if (!this.isModified('password'))
    return next();

  try {
    // generate a hash. argon2 does the salting and hashing for us
    const hash = await argon2.hash(this.password);
    // override the plaintext password with the hashed one
    this.password = hash;
    next();
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// This is a method that we can call on User objects to compare the hash of the
// password the browser sends with the has of the user's true password stored in
// the database.
userSchema.methods.comparePassword = async function(password) {
  try {
    // note that we supply the hash stored in the database (first argument) and
    // the plaintext password. argon2 will do the hashing and salting and
    // comparison for us.
    const isMatch = await argon2.verify(this.password, password);
    return isMatch;
  } catch (error) {
    return false;
  }
};

// This is a method that will be called automatically any time we convert a user
// object to JSON. It deletes the password hash from the object. This ensures
// that we never send password hashes over our API, to avoid giving away
// anything to an attacker.
userSchema.methods.toJSON = function() {
  var obj = this.toObject();
  delete obj.password;
  return obj;
}

// create a User model from the User schema
const User = mongoose.model('User', userSchema);

/* Middleware */

// middleware function to check for logged-in users
const validUser = async (req, res, next) => {
  if (!req.session.userID)
    return res.status(403).send({
      message: "not logged in"
    });
  try {
    const user = await User.findOne({
      _id: req.session.userID
    });
    if (!user) {
      return res.status(403).send({
        message: "not logged in"
      });
    }
    // set the user field in the request
    req.user = user;
  } catch (error) {
    // Return an error if user does not exist.
    return res.status(403).send({
      message: "not logged in"
    });
  }

  // if everything succeeds, move to the next middleware
  next();
};

/* API Endpoints */

/* All of these endpoints start with "/" here, but will be configured by the
   module that imports this one to use a complete path, such as "/api/user" */

// create a new user
app.post('/api/users', async (req, res) => {
  // Make sure that the form coming from the browser includes all required fields,
  // otherwise return an error. A 400 error means the request was
  // malformed.
  if (!req.body.firstName || !req.body.lastName || !req.body.username || !req.body.password)
    return res.status(400).send({
      message: "first name, last name, username and password are required"
    });

  try {

    //  Check to see if username already exists and if not send a 403 error. A 403
    // error means permission denied.
    const existingUser = await User.findOne({
      username: req.body.username
    });
    if (existingUser)
      return res.status(403).send({
        message: "username already exists"
      });

    // create a new user and save it to the database
    const user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      username: req.body.username,
      password: req.body.password
    });
    await user.save();
    // set user session info
    req.session.userID = user._id;

    // send back a 200 OK response, along with the user that was created
    return res.send({
      user: user
    });
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

// login a user
app.post('/api/users/login', async (req, res) => {
  // Make sure that the form coming from the browser includes a username and a
  // password, otherwise return an error.
  if (!req.body.username || !req.body.password)
    return res.sendStatus(400);

  try {
    //  lookup user record
    const user = await User.findOne({
      username: req.body.username
    });
    // Return an error if user does not exist.
    if (!user)
      return res.status(403).send({
        message: "username or password is wrong"
      });

    // Return the SAME error if the password is wrong. This ensure we don't
    // leak any information about which users exist.
    if (!await user.comparePassword(req.body.password))
      return res.status(403).send({
        message: "username or password is wrong"
      });

    // set user session info
    req.session.userID = user._id;

    return res.send({
      user: user
    });

  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

// get logged in user
app.get('/api/users', validUser, async (req, res) => {
  try {
    res.send({
      user: req.user
    });
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

// logout
app.delete("/api/users", validUser, async (req, res) => {
  try {
    req.session = null;
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

// add a recipe to favorites
app.post("/api/users/add/:recipeID", validUser, async (req, res) => {
  try {
    let user = req.user;
    let recipe = await Recipe.findOne({
      _id: req.params.recipeID
    });
    if (!recipe) {
        res.send(404);
        return;
    }
    user.recipes.push(recipe);
    await user.save();
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// get recipes for user
app.get("/api/users/recipes", validUser, async (req, res) => {
  try {
    let user = await User.findOne({
      _id: req.user._id
    });

    await user.populate('recipes').execPopulate();

    let recipes = user.recipes[0];
    return res.send(user.recipes);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// remove recipe from user favorites
app.delete("/api/users/remove/:recipeID", validUser, async (req, res) => {
  try {
    let user = await User.findOne({
      _id: req.user._id
    });

    await user.populate('recipes').execPopulate();

    for (let i = 0; i < user.recipes.length; i++) {
      if (user.recipes[i]._id == req.params.recipeID) {
        user.recipes.splice(i, 1);
        await user.save();
      }
    }

    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

app.listen(3001, () => console.log('Server listening on port 3001!'));
