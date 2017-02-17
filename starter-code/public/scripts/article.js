'use strict';

function Article (opts) {
  // REVIEW: Convert property assignment to a new pattern. Now, ALL properties of `opts` will be
  // assigned as properies of the newly created article object. We'll talk more about forEach() soon!
  // We need to do this so that our Article objects, created from DB records, will have all of the DB columns as properties (i.e. article_id, author_id...)
  Object.keys(opts).forEach(function(e) {
    this[e] = opts[e]
  }, this);
}

Article.all = [];

// ++++++++++++++++++++++++++++++++++++++

// REVIEW: We will be writing documentation today for the methods in this file that handles Model layer of our application. As an example, here is documentation for Article.prototype.toHtml(). You will provide documentation for the other methods in this file in the same structure as the following example. In addition, where there are TODO comment lines inside of the method, describe what the following code is doing (down to the next TODO) and change the TODO into a DONE when finished.

/**
 * OVERVIEW of Article.prototype.toHtml():
 * - A method on each instance that converts raw article data into HTML
 * - Inputs: nothing passed in; called on an instance of Article (this)
 * - Outputs: HTML of a rendered article template
 */
Article.prototype.toHtml = function() {
  // DONE: Retrieves the  article template from the DOM and passes the template as an argument to the Handlebars compile() method, with the resulting function being stored into a variable called 'template'.
  var template = Handlebars.compile($('#article-template').text());

  // DONE: Creates a property called 'daysAgo' on an Article instance and assigns to it the number value of the days between today and the date of article publication
  this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);

  // DONE: Creates a property called 'publishStatus' that will hold one of two possible values: if the article has been published (as indicated by the check box in the form in new.html), it will be the number of days since publication as calculated in the prior line; if the article has not been published and is still a draft, it will set the value of 'publishStatus' to the string '(draft)'
  this.publishStatus = this.publishedOn ? `published ${this.daysAgo} days ago` : '(draft)';

  // DONE: Assigns into this.body the output of calling marked() on this.body, which converts any Markdown formatted text into HTML, and allows existing HTML to pass through unchanged
  this.body = marked(this.body);

// DONE: Output of this method: the instance of Article is passed through the template() function to convert the raw data, whether from a data file or from the input form, into the article template HTML
  return template(this);
};

// ++++++++++++++++++++++++++++++++++++++

// DONE
/**
 * OVERVIEW of
 * - Describe what the method does: This is a method that takes in an array of objects as an argument, sorts the array by the property 'publishedOn' from each of those objects, then have them all sorted out. After that it iterates over each instance in the sorted array and push it into Article.all.

 * - Inputs: identify any inputs and their source: Article.loadAll takes an array of objects as a parameter
 * - Outputs: identify any outputs and their destination: We have sorted instances in Article.all
 */
Article.loadAll = function(rows) {
  // DONE: describe what the following code is doing
  // A method that takes rows as a parameter and calls the sort method on 'rows', pass in two parameters to that sorting function and return the array of dates subtracted.

  rows.sort(function(a,b) {
    return (new Date(b.publishedOn)) - (new Date(a.publishedOn));
  });

  // DONE: describe what the following code is doing
  //After that we use the new sorted array and iterate using forEach on instances to push them into the 'new Artile.all'
  rows.forEach(function(ele) {
    Article.all.push(new Article(ele));
  })
};

// ++++++++++++++++++++++++++++++++++++++

// DONE
/**
 * OVERVIEW of
 * - Describe what the method does: Calling the fetchAll method to check if records exist in the database and populates it from the local JSON file, otherwise load the 'hackerIpsum.json' to the database.

 * - Inputs: identify any inputs and their source
 * - Outputs: identify any outputs and their destination
 */
Article.fetchAll = function(callback) {
  // DONE: describe what the following code is doing
  // Calling the jQuery AJAX method of .get on the link/route of /articles then Loads the data from a server using an HTTP GET request.
  $.get('/articles')
  // DONE: describe what the following code is doing
  //We are calling the method .then with an anonymous function that takes results an a parameter

  .then(
    function(results) {
      if (results.length) { // If records exist in the DB
        // DONE: describe what the following code is doing
        //call the loadAll method with the result passed in as parameter, then a usuall callback function which in this case doesnt pass in antthing
        Article.loadAll(results);
        callback();
      } else { // if NO records exist in the DB
        // DONE: describe what the following code is doing
        //Get the data from the 'hackerIpsum.json' file and iterate over each object, then insert them as records to the data base
        $.getJSON('./data/hackerIpsum.json')
        .then(function(rawData) {
          rawData.forEach(function(item) {
            let article = new Article(item);
            article.insertRecord(); // Add each record to the DB
          })
        })
        // DONE: describe what the following code is doing
        //After we insert our data to database we call the fetchAll function that fires all the methods on our instances to render to the dom.
        .then(function() {
          Article.fetchAll(callback);
        })
        // DONE: describe what the following code is doing
        //A reminder if we are executing the function outside the if/else statement then throw an error
        .catch(function(err) {
          console.error(err);
        });
      }
    }
  )
};

// ++++++++++++++++++++++++++++++++++++++

// DONE
/**
 * OVERVIEW of
 * - Describe what the method does : Basically calling the method 'truncateTable' on our constructor and passing a callback function.
 * - Inputs: identify any inputs and their source
 * - Outputs: identify any outputs and their destination
 */
Article.truncateTable = function(callback) {
  // DONE: describe what the following code is doing
  //using ajax to request the server.js to send a delete order to our dataBase to empty the table in database
  $.ajax({
    url: '/articles',
    method: 'DELETE',
  })
  // DONE: describe what the following code is doing
  //feedback function (which is empty for now) that usually fires after doing the requested method in the .ajax
  .then(function(data) {
    console.log(data);
    if (callback) callback();
  });
};

// ++++++++++++++++++++++++++++++++++++++

// DONE
/**
 * OVERVIEW of
 * - Describe what the method does: adding a prototype method to our constructor that inserts a record to the data base
 * - Inputs: identify any inputs and their source
 * - Outputs: identify any outputs and their destination
 */
Article.prototype.insertRecord = function(callback) {
  // DONE: describe what the following code is doing
  //posting our object elements to the router '/articles' and pass it the server.js
  $.post('/articles', {author: this.author, authorUrl: this.authorUrl, body: this.body, category: this.category, publishedOn: this.publishedOn, title: this.title})
  // DONE: describe what the following code is doing
  //feedback function that is called after posting to the server
  .then(function(data) {
    console.log(data);
    if (callback) callback();
  })
};

// ++++++++++++++++++++++++++++++++++++++

// DONE
/**
 * OVERVIEW of
 * - Describe what the method does : delete a record from database with a callback function
 * - Inputs: identify any inputs and their source
 * - Outputs: identify any outputs and their destination
 */
Article.prototype.deleteRecord = function(callback) {
  // DONE: describe what the following code is doing
  // Deleting a specific record from data base using ajax route to a specific id in the database table
  $.ajax({
    url: `/articles/${this.article_id}`,
    method: 'DELETE'
  })
  // DONE: describe what the following code is doing
  //feedback function to show message or do something after the deletion
  .then(function(data) {
    console.log(data);
    if (callback) callback(); //showMessage();
  });
};

// function showMessage(){
//   console.log('adaDa');
//
// }
//
// article.deleteRecord(showMessage);
// ++++++++++++++++++++++++++++++++++++++

// DONE
/**
 * OVERVIEW of
 * - Describe what the method does: Updating a record in the database
 * - Inputs: identify any inputs and their source
 * - Outputs: identify any outputs and their destination
 */
Article.prototype.updateRecord = function(callback) {
  // DONE: describe what the following code is doing
  //updating a specific record from data base using ajax route to a specific id in the database table with PUT method
  $.ajax({
    url: `/articles/${this.article_id}`,
    method: 'PUT',
    data: {  // DONE: describe what this object is doing
      //Gets our recent data objects and adds it to the specified id record in the database table
      author: this.author,
      authorUrl: this.authorUrl,
      body: this.body,
      category: this.category,
      publishedOn: this.publishedOn,
      title: this.title
    }
  })
  // DONE: describe what the following code is doing
  //firing the callback function after updating
  .then(function(data) {
    console.log(data);
    if (callback) callback();
  });
};
