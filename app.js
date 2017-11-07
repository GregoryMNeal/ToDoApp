/* ToDo App

Functional Requirements:

Create a database with the following schema:

CREATE TABLE task (
  id serial PRIMARY KEY,
  description varchar,
  done boolean
);
The app should meet the following requirements:

URL /todos should list all your ToDos
URL /todos/add should have a form which lets you add a ToDo
URL /todo/done/:id should mark a ToDo as done.

*/

var express = require('express'); // used to make an Express app
var app = express(); // make the app
app.set('view engine', 'hbs'); // use handlebars for template rendering
var pgp = require('pg-promise')({
  // initialization options
}); // for accessing database
var db = pgp({database: 'todo'});
const body_parser = require('body-parser');
app.use(body_parser.urlencoded({extended: false}));

// get method for root URL:/
app.get('/', function (req, resp) {
  resp.send('To-Do App');
});

// List to-do's
app.get('/todos', function (req, resp) {
  var q = 'SELECT * from task;';
  db.any(q)
    .then(function (result) {
      var context = {title: 'To-do Items', result: result};
      resp.render('todos.hbs', context);
  });
});

// Display form to enter to-do's
app.get('/todos/add', function (req, resp) {
  var context = {title: 'Add To-do Item'};
  resp.render('addtodo.hbs', context);
});

// Add a to-do to the database
app.post('/todos/add', function (req, resp) {
  // Get input from form
  var form_description = req.body.description;
  // Write a to-do to the database
  var task_info = {
    description: form_description,
    done: "FALSE"
  };
  var q = 'INSERT INTO task \
    VALUES (default, ${description}, ${done}) RETURNING id';
  db.one(q, task_info)
    .then(function (result) {
      console.log('Created task with ID ' + result.id);
      // redirect to display all to-do's
      resp.redirect('/todos');
  });
});

// Mark to-do as done
app.get('/todo/done/:id', function (req, resp) {
  var task_id = req.params.id;
  var q = 'UPDATE task SET done = TRUE \
    WHERE id = $1';
  console.log(q, task_id);
  db.result(q, task_id)
    .then(function (result) {
      console.log('Changed task to completed');
      // redirect to display all to-do's
      resp.redirect('/todos');
    })
});

// Listen for requests
app.listen(8000, function() {
  console.log('* Listening on port 8000 *')
});
