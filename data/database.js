import pmongo from 'promised-mongo';

const db = pmongo('relaytest', ['users', 'todos']);

export function getUser() {
  return db.users.findOne({ name: 'admin' });
}

export function getTodos() {
  return db.todos.find({ user: 'admin' }).toArray().then((docs) => docs);
}

export function getTodo(id) {
  return db.todos.findOne({ _id: pmongo.ObjectId(id), user: 'admin' });
}

export function updateTodo(id, todo, completed) {
  if (!id || !todo || typeof completed !== 'boolean') {
	return new Promise((resolve, reject) => {
	  let message = "";
	  if (!id) {
		message += '"id" required to update Todo Item\n';
	  }
	  if (!todo) {
		message += '"todo" required to update Todo Item\n';
	  }
	  if (typeof completed !== 'boolean') {
		message += '"completed" should be a boolean\n';
	  }

	  reject(message);
	});
  }
  return db.todos.update({ _id: pmongo.ObjectId(id), user: 'admin' },
						   { $set: { todo, completed } })
				  .then(() => { return { todo: id }; });
}

export function addTodo(todo) {
  if (!todo) {
	return new Promise((resolve, reject) => {
	  let message = '"todo" cannot be empty';
	  reject(message);
	});
  }
  return db.todos.insert({ todo, completed: false, user: 'admin' });
}

export function removeTodo(id) {
  if (!id) {
	return new Promise((resolve, reject) => {
	  reject('"id" required to remove a Todo item');
	});
  }
  return db.todos.remove({ _id: pmongo.ObjectId(id), user: 'admin' })
				 .then(() => { return { todo: id }; });
}
