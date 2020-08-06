'use strict';

var ENTER_KEY = 13;
var ESCAPE_KEY = 27;
var TAB_KEY = 9;

var util = {
	uuid: function () {
		/*jshint bitwise:false */
		var i, random;
		var uuid = '';

		for (i = 0; i < 32; i++) {
			random = Math.random() * 16 | 0;
			if (i === 8 || i === 12 || i === 16 || i === 20) {
				uuid += '-';
			}
			uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
		}

		return uuid;
	},
	pluralize: function (count, word) {
		return count === 1 ? word : word + 's';
	},
	store: function (namespace, data) {
		if (arguments.length > 1) {
			return localStorage.setItem(namespace, JSON.stringify(data));
		} else {
			var store = localStorage.getItem(namespace);
			return (store && JSON.parse(store)) || [{
				completed: false,
				id: util.uuid(),
				nestedTodos: [ {
					completed: false,
					id: util.uuid(),
					nestedTodos: [{
						completed: false,
						id: util.uuid(),
						nestedTodos: [
							{
								completed: false,
								id: util.uuid(),
								nestedTodos: [],
								notes: "",
								title: "Press 'enter' to create a new todo.",
							},
							{
								completed: false,
								id: util.uuid(),
								nestedTodos: [],
								notes: "",
								title: "Press 'tab' to nest a todo.",
							},
							{
								completed: false,
								id: util.uuid(),
								nestedTodos: [],
								notes: "",
								title: "Press 'shift+tab' to un-nest a todo.",
							},
							{
								completed: false,
								id: util.uuid(),
								nestedTodos: [],
								notes: "",
								title: "Press 'ctrl+enter' to toggle completed.",
							},
							{
								completed: false,
								id: util.uuid(),
								nestedTodos: [],
								notes: "this is a note!",
								title: "Press 'shift+enter' to toggle notes.",
							},
							{
								completed: false,
								id: util.uuid(),
								nestedTodos: [],
								notes: "",
								title: "Press 'backspace' to delete a todo.",
							},
						],
						notes: "",
						title: "Settings:"						
					}],
					title: "",
					notes: ""
				},
				{
					completed: false,
					id: util.uuid(),
					nestedTodos: [],
					notes: "",
					title: "",	
				}
				 ],
				title: "Welcome To My Nested Todo List!",
				notes: ""
			}];
		}
	}
};

var handlers = {
	setUpEventListeners: function() {
		var todoListObj = document.getElementById('main-todo-list');

		// prevent enter key from breaking contentEditable span.
		todoListObj.addEventListener('keydown', function(event) {
			if (event.target.classList.value === 'edit') {
				if (event.key === 'Enter') {
					// stops enter key from breaking line.
					event.preventDefault();
				}
			}
		});	

		todoListObj.addEventListener('change', function(e) {
			if (e.target.classList.value === 'toggle') {
				app.toggle(e);
			}
		});
		
		todoListObj.addEventListener('focusout', function(e) {
			if (e.target.classList.value === 'edit') {
				app.update(e);
			}
			if (e.target.classList.value === 'note') {
				app.updateNote(e);
			}			
		});

		// CreateNewTodo
		todoListObj.addEventListener('keyup', function(event) {
			if (event.target.classList.value === 'edit') {
				if (event.key === 'Enter' && event.shiftKey == false && event.ctrlKey === false) {
					app.createNewTodo(event);

				}
			}
		});

		// Nest Todo
		// Use tab to nest the todo.
		todoListObj.addEventListener('keydown', function(event) {
			if (event.target.classList.value === 'edit') {
				// event.shiftKey needs to be set to false.
				// If not it will invoke the function even when you press shift.
				if (event.key === 'Tab' && event.shiftKey == false) {
					event.preventDefault();
					app.nested(event);					
				}	
			}
		

		});
		// unNest
		todoListObj.addEventListener('keydown', function(event) {
			if (event.target.classList.value === 'edit') {
				if (event.key === 'Tab' && event.shiftKey == true) {
					event.preventDefault();
					app.unNest(event);
				}
			}
		});


		// event.key === 'Backspace' || event.keyCode === 8
		todoListObj.addEventListener('keydown', function(event) {
			if (event.target.classList.value === 'edit') {
				if (event.key === 'Backspace') {
					// if (event.target.value === '') {
					if (event.target.textContent === '') {
						app.destroy(event);
					}	
				}
			}
		});	


		// toggle completed keyboard shortcut
		todoListObj.addEventListener('keydown', function(event) {
			if (event.target.classList.value === 'edit') {
				if (event.key === 'Enter' && event.ctrlKey) {

					app.toggle(event);
					// console.log(true);
				}
			}
		});	


		// Notes
		todoListObj.addEventListener('keydown', function(event) {
			if (event.target.classList.value === 'edit') {
				
				if (event.key === 'Enter' && event.shiftKey === true) {
					event.preventDefault();
					views.focusOnNote(event);
					
				}
			} else if (event.target.classList.value === 'note') {
				if (event.key === 'Enter' && event.shiftKey === true) {
					event.preventDefault();
					views.focusOnTodo(event);
				}				
			}
		});	
	}

};

var views = {

	HTMLElements: function(todos, accessPoint) {
		// If the accessPoint does not find a 'ul'
		if (accessPoint.querySelector('ul') === null) {
			// Create a ul
			var ulElement = document.createElement('ul');
			// Attach 'ul' to the accessPoint
			accessPoint.appendChild(ulElement);
		}

		for (var i = 0; i < todos.length; i++) {
			// li element
			var liElement = document.createElement('li');
			liElement.setAttribute('data-id', todos[i].id);
			ulElement.appendChild(liElement);
			
				// div element with class.
				var divElement = document.createElement('div');
				divElement.setAttribute('class', 'view');
				liElement.appendChild(divElement);

					var bullitSpan = document.createElement('span');
					bullitSpan.innerHTML = '•';
					bullitSpan.setAttribute('class', 'bullit');	
					divElement.appendChild(bullitSpan);

					// Todo - contenteditable span with class todo.
					var todoSpan = document.createElement('span');
					todoSpan.setAttribute('contenteditable', true);
					todoSpan.setAttribute('class', 'edit');	
					todoSpan.setAttribute('value', todos[i].title);
					todoSpan.textContent = todos[i].title;

					if (todos[i].completed === true) {
						todoSpan.style.textDecoration = "line-through"; 
						todoSpan.style.color = "gray"; 
					}
					divElement.appendChild(todoSpan);

					var noteDiv = document.createElement('div');
					divElement.appendChild(noteDiv);

						var noteElement = document.createElement('span');
						if (todos[i].notes.length === 0) {
							noteElement.style.display = 'none';
						}
						noteElement.setAttribute('contenteditable', true);
						noteElement.setAttribute('class', 'note');	
						noteElement.textContent = todos[i].notes;
						noteDiv.appendChild(noteElement);	

			if (todos[i].nestedTodos.length > 0) {
				// recusively print to page all nested todos.
				views.HTMLElements(todos[i].nestedTodos, liElement);
			}
		}
	},
	render: function () {

		var todos = app.todos;
		var ulElement = document.getElementById('todo-list');
		var mainTodoList = document.getElementById('main-todo-list');
		
		// clear the innerHTML of the page.
		mainTodoList.innerHTML = "";
		// print all elements to page.
		this.HTMLElements(todos, mainTodoList);
		// Store to localStorage every time the render function is run.
		util.store('todos-jquery', app.todos);	
	},
	focusOnNote: function(event) {
		// views.render();
		var dataId = event.target.closest('li').getAttribute('data-id');

		var findNoteToFocusOnId = app.getTodoByDataId(app.todos, dataId, function(todoArray, i) {
			return todoArray[i].id;
		});

		views.render();
		// grab the note paragraph
		// var todoNote = document.querySelectorAll('[data-id="' + findNoteToFocusOnId + '"]')[0].children[0].children[2];
		var todoNote = document.querySelectorAll('[data-id="' + findNoteToFocusOnId + '"]')[0].querySelector('.note');
		// set the display to block so you have the ablitiy to fill it in.  becaues in views if the note is empty it will render display: none
		todoNote.style.display = 'inline-block';
		// Focus on the element.
		todoNote.focus();	
		
	},
	focusOnTodo: function(event) {
		// views.render();
		var dataId = event.target.closest('li').getAttribute('data-id');

		var findTodoToFocusOnId = app.getTodoByDataId(app.todos, dataId, function(todoArray, i) {
			return todoArray[i].id;
		});

		views.render();

		var focusOTodoSpan = document.querySelectorAll('[data-id="' + findTodoToFocusOnId + '"]')[0].querySelector('.edit');
		focusOTodoSpan.focus();	
		
	},	
};

var app = {
	init: function () {
		this.todos = util.store('todos-jquery');
		views.render();
		handlers.setUpEventListeners(); 			
	},	
	createNewTodo: function(e) {
		var input = e.target;
		var dataId = input.closest('li').getAttribute('data-id');
		var newTodoObj = {
			id: util.uuid(),
			title: "",
			completed: false,
			nestedTodos: [],
			notes: ""

		};
		// Accessing the properties of the todo by using the dataId which was accessed by the event handler.
		// function accessTodoByDataId(todoArray, dataId) {
		// 	for (var i = 0; i < todoArray.length; i++) {
		// 		// Is this the todo which initated the event?
		// 		if (todoArray[i].id === dataId) {
		// 			// Push the newTodoObj into the todoArray
		// 			// Return the value to the function call.

		// 			// return todoArray.push(newTodoObj);
		// 			return todoArray.splice(i + 1, 0, newTodoObj);


		// 		// If not recursively call accessTodoByDataId and pass in the nestedTodo array.
		// 		} else {
		// 			var returnValueOfAccessTodoByDataId = accessTodoByDataId(todoArray[i].nestedTodos, dataId);
		// 			// if this function call returns a value that is not equal to undefined
		// 			// continue looping through the array.
		// 			if (returnValueOfAccessTodoByDataId !== undefined) {
		// 				// if it does return a value end the loop.
		// 				return returnValueOfAccessTodoByDataId;
		// 			}
		// 		}
		// 	}
		// }
		// accessTodoByDataId(app.todos, dataId);

		this.getTodoByDataId(this.todos, dataId, function(todoArray, i) {
			return todoArray.splice(i + 1, 0, newTodoObj);
		});

		// Render the views.
		views.render();
		document.querySelector('[data-id="' + newTodoObj.id + '"]').querySelector('.edit').focus();	
		
	},
	// Nest the todo by using the tab button
	nested: function(e) {

		// you are trying to nest todo (tab to the right), but there is no parent element to attach it to.
		// return out of the function.
		if (e.target.parentElement.parentElement.previousSibling === null) {
			return;
		}		

		var input = e.target;
		var dataId = input.closest('li').getAttribute('data-id');

		function getTodoObjByDataId(todoArray, dataId) {
			for (var i = 0; i < todoArray.length; i++) {
				// base case
				if (todoArray[i].id === dataId) {
					var todoObj = {
						completed: todoArray[i].completed,
						id: todoArray[i].id,
						// make sure to save the nestedTodos to the Object.
						nestedTodos: todoArray[i].nestedTodos,
						title: todoArray[i].title,
						notes: todoArray[i].notes							
					};
					
					todoArray.splice(i, 1);
					return todoObj;
				} else {
					if (todoArray[i].nestedTodos.length > 0) {
						var returnValueOfGetTodoObjByDataId = getTodoObjByDataId(todoArray[i].nestedTodos, dataId);
						if (returnValueOfGetTodoObjByDataId !== undefined) {
							return returnValueOfGetTodoObjByDataId;
						}	
					}
				}
			}
		}

		var lookingForNestedTodo = getTodoObjByDataId(app.todos, dataId);


		var dataIdToNest = e.target.parentElement.parentElement.previousSibling.getAttribute('data-id');

		function nestThisTodo(todoArray, dataId) {
			for (var i = 0; i < todoArray.length; i++) {
				if (todoArray[i].id === dataId) {
					todoArray[i].nestedTodos.push(lookingForNestedTodo);
				} else {
					var returnValueofNestThisTodo = nestThisTodo(todoArray[i].nestedTodos, dataId);
					if (returnValueofNestThisTodo !== undefined) {
						return returnValueofNestThisTodo;
					}
				}
			}
		}

		nestThisTodo(app.todos, dataIdToNest);
		
		views.render();
		var focusOnNested = document.querySelectorAll('[data-id="' + dataId + '"]')[0].querySelector('.edit');
		focusOnNested.focus();
		


			

		
	},
	unNest: function(e) {

		// When you are on the top level todoArray
		// this prevents from throwing error and trying to unnest into something that does not exist.
		if (e.target.parentElement.parentElement.parentElement.parentElement.id === 'main-todo-list') {
			return;
		}



		// console.log("you did it");

		// find the id of the todo in question
		var dataIdOfTodoToUnNest = e.target.closest('li').getAttribute('data-id');
		// console.log(dataIdOfTodoToUnNest);

		// clone the todo
			// recurse through the Array and subArrays to access the todo
				// clone the todo
				// splice to todo from its current array

		function findParentTodoId(todoArray, dataId) {
			for (var i = 0; i < todoArray.length; i++) {
				if (todoArray[i].id === dataId) {
					var unNestTodoObj = {
							completed: todoArray[i].completed,
							id: todoArray[i].id,
							nestedTodos: todoArray[i].nestedTodos,
							title: todoArray[i].title,
							notes: todoArray[i].notes							
					};
					todoArray.splice(i, 1);
					return unNestTodoObj;
				} else {
					var returnValueOffindParentTodoId = findParentTodoId(todoArray[i].nestedTodos, dataId);
					if (returnValueOffindParentTodoId !== undefined) {
						// return the id of the parent where the dataId was found.
						// console.log(todoArray[i].id);
						// return to end the function otherwise it will continue to loop and delete it again.
						// todoArray.push(returnValueOffindParentTodoId);
						todoArray.splice(i + 1, 0, returnValueOffindParentTodoId);
						return;
					}
				}
			}
		}

		findParentTodoId(this.todos, dataIdOfTodoToUnNest);
		views.render();
		
		var focusOnUnNested = document.querySelectorAll('[data-id="' + dataIdOfTodoToUnNest + '"]')[0].querySelector('.edit');
		focusOnUnNested.focus();
		// find the id of the parent todo
		// insert clone into parent todo subtodo array
	},
	getTodoByDataId: function(todoArray, dataId, callback) {
		for (var i = 0; i < todoArray.length; i++) {

			// base case
			if (todoArray[i].id === dataId) {
				return callback(todoArray, i);
			// recursive case
			} else {
				var returnValue = app.getTodoByDataId(todoArray[i].nestedTodos, dataId, callback);
				if (returnValue !== undefined) {
					return returnValue;
				}
			}
		}
	},	

	toggle: function (e) {

		var dataId = e.target.closest('li').getAttribute('data-id');

		// function getTodoFromId(todoList, dataId) {
		// 	for (var i = 0; i < todoList.length; i++) {
		// 		if (todoList[i].id === dataId) {
		// 			//base case
		// 			// CSS to strike through toggle
		// 			return todoList[i].completed = !todoList[i].completed;					
		// 		} else {
		// 			var returnValueOfGetTodoFromId = getTodoFromId(todoList[i].nestedTodos, dataId);
		// 			if (returnValueOfGetTodoFromId !== undefined) {
		// 				return returnValueOfGetTodoFromId;
		// 			}
		// 		}
		// 	}
		// }
		// getTodoFromId(this.todos, dataId);

		this.getTodoByDataId(this.todos, dataId, function(todoList, i) {
			return todoList[i].completed = !todoList[i].completed;
		});

		views.render();
		var focusOnToggle = document.querySelectorAll('[data-id="' + dataId + '"]')[0].querySelector('.edit');
		focusOnToggle.focus();		

	},
	update: function (e) {

		var spanContent = e.target.textContent;
		var val = spanContent;
		var dataId = e.target.closest('li').getAttribute('data-id');

		// recursively go through all arrays until you match the ids
		// if you match the ids
			// update the values and return to end the function
		// if the return value does not equal undefined return out of the funciton 
			// otherwise continue to loop

		this.getTodoByDataId(this.todos, dataId, function(todoList, i) {
			return todoList[i].title = val;
		});
		views.render();
	},
	destroy: function (e) {

		// prevent removal of base todolist from application.
		if (app.todos.length === 1 && app.todos[0].nestedTodos.length === 0) {
			return;
		}

		var dataId = e.target.closest('li').getAttribute('data-id');
		this.getTodoByDataId(app.todos, dataId, function(todoArray, i) {
			return todoArray.splice(i, 1);
		});
		console.log("Destroy");
		views.render();
	},
	updateNote: function(event) {
		var textContent = event.target.textContent;
		var dataId = event.target.closest('li').getAttribute('data-id');
		this.getTodoByDataId(this.todos, dataId, function(todoList, i) {
			return todoList[i].notes = textContent;
		});
	}

};

app.init();
























