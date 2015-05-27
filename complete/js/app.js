'use strict';

// 1. Create the namespace for our app
var app = {}; // the namespace


// 2. Add the model
app.Todo = Backbone.Model.extend({	// create a 'Todo' model
	defaults: {						// object w/ properties
		title: '',
	    completed: false
	},
	toggle: function(){  // toggle function
        this.save({ completed: !this.get('completed')});
    }
});

// 3. Define & Instantiate the colleciton
app.TodoList = Backbone.Collection.extend({
	model: app.Todo,
	localStorage: new Store("backbone-todo")
});

// instance of the Collection
app.todoList = new app.TodoList();

// 4. Render individual todo items list (li)
app.TodoView = Backbone.View.extend({
    tagName: 'li',
    template: _.template($('#item-template').html()),
    render: function(){
        this.$el.html(this.template(this.model.toJSON()));
        // 6. Add input to list object
        this.input = this.$('.edit'); 	// grab input from item flagged as 'edit'
        return this; 					// enable chained calls
    },
    // 7. Register the 'on change' event
    initialize: function(){
        this.model.on('change', this.render, this);
        // 10. Add destroy listener
        this.model.on('destroy', this.remove, this); // remove: Convenience Backbone's function for removing the view from the DOM.
    },
    // 8. Add 'editing' event listeners
    events: {
        'keypress .edit' : 'updateOnEnter',
        'dblclick label' : 'edit',      // edit a ToDo item event
        'blur .edit' : 'close',         // blurs when finished editing a ToDo item
        'click .toggle': 'toggleCompleted',     // respond to toggle event
        'click .destroy': 'destroy'         	// register on click to destroy
    },
    // 9. Add functions for editing behaviors
    edit: function(){
        this.$el.addClass('editing');
        this.input.focus();
    },
    close: function(){
        var value = this.input.val().trim();
        if(value) {
            this.model.save({title: value});
        }
        this.$el.removeClass('editing');
    },
    updateOnEnter: function(e){
        if(e.which === 13){
            this.close();
        }
    },
    toggleCompleted: function(){
        this.model.toggle();
    },
    destroy: function() {
    	this.model.destroy();
	}
});

// 5. Create ToDo Items & Populate the View
// renders the full list of todo items calling TodoView for each one.
app.AppView = Backbone.View.extend({
        el: '#todoapp',                 // the element in HTML we're binding to the app view
        initialize: function () {
        this.input = this.$('#new-todo');
        // when new elements are added to the collection render then with addOne
        app.todoList.on('add', this.addOne, this);
        app.todoList.on('reset', this.addAll, this);
        app.todoList.fetch();           // loads list from local storage
    },
    events: {                           // adding the event from before to our app
    'keypress #new-todo': 'createTodoOnEnter'
    },
    createTodoOnEnter: function(e){
        if ( e.which !== 13 || !this.input.val().trim() ) { // ENTER_KEY = 13
            return;
        }
        app.todoList.create(this.newAttributes());
        this.input.val('');             // clean input box
    },
    addOne: function(todo){
        var view = new app.TodoView({model: todo});
        $('#todo-list').append(view.render().el);
    },
    addAll: function(){
        this.$('#todo-list').html('');  // clean the todo list
        app.todoList.each(this.addOne, this);
    },
    newAttributes: function(){          // creates a new instance of the model w/ values
        return {
            title: this.input.val().trim(),
            completed: false
        }
    }
});

//--------------
// Initializers
//--------------   

app.appView = new app.AppView();        // intializing the app view