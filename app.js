//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");

const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

//the below lines makes and connects to our mongoDB by using mongoose
mongoose.connect("mongodb+srv://admil-Ayush:omsri@234@cluster0.h7m7u.mongodb.net/todolistDB?retryWrites=true&w=majority", {
 keepAlive: true,
   useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});




//The below lines are used to creat items inside todolistDB
const itemsSchema = new mongoose.Schema({

  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item = new Item({
  name: "Welcome to your todolist"
});
const item1 = new Item({
  name: "Creat your list of the day"
});



const defaultItems = [item, item1];
//Code bilow is written for List

const listSchema = {

  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);



//th e below code takes post request and renders the items in the website todolist
app.get("/", (req, res) => {

  Item.find({}, (err, foundItems) => {

    if (foundItems.length === 0) {

      Item.insertMany(defaultItems, (errr) => {
        if (errr) {
          console.log(errr);
        } else {
          console.log("items added successfully");
        }


      });

      res.redirect("/");

    } else {

      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }
  });
});


// The below line  makes an post request and redirects to app.get("/") root raout
app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, (err, foundList) => {


      foundList.items.push(item);
      foundList.save();
      res.redirect('/' + listName);


    });
  }
});

//To create custom list example:work,home etc etc
app.get("/:customListName", (req, res) => {

  const customlistName = _.capitalize(req.params.customListName); //to automatically capitalise and arange the words using lodash


  List.findOne({
    name: customlistName
  }, (err, foundList) => {

    if (!err) {
      if (!foundList) {
        const list = new List({

          name: customlistName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customlistName);
      } else {
        const day = "Today";

        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }

    }
  });
});

//The below  line makes an algo to delete items from the items array
app.post("/delete", (req, res) => {

  const checkedItemId = req.body.checkedBox;
  const listName = req.body.listName;
  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, (err) => {

      if (!err) {
        res.redirect("/");
      }
    });
  } else {

    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: checkedItemId
        }
      }
    }, (err, foundList) => {
      if (!err) {
        res.redirect("/" + listName);
      }
    });

  }
});



app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(process.env.PORT, function() {
  console.log("Server started on port 3000");
});
