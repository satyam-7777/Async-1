const fetch = require("node-fetch");

// write your code here

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const todoPromise = async (user) => {
  const response = await fetch(`http://localhost:3000${user.todos}`);

  if (!response.ok) {
    throw new Error(`Todo request failed for user ${user.id}: ${response.status}`);
  }

  const todoData = await response.json();

  return todoData;
};

async function getAllUsers() {
  const response = await fetch("http://localhost:3000/users");

  if (!response.ok) {
    throw new Error("error while fetching the user");
  }

  const jsonResponse = await response.json();
  const { users } = jsonResponse;
  return users;
}

async function getUserToDos() {
  try {
    const users = await getAllUsers();
    let userWiseToDoData = [];

    for (let index = 0; index < users.length; index += 5) {
      const usersBatch = users.slice(index, index + 5);

      const todoResponse = await Promise.all(usersBatch.map((user) => todoPromise(user)));

      userWiseToDoData.push(...todoResponse);

      if (index + 5 < users.length) await wait(1000);
    }

    const finalData = userWiseToDoData.reduce((result, userTodo) => {
      const { todos } = userTodo;
      const completedTodoCount = todos.filter((eachTodo) => eachTodo.isCompleted).length;
      const userId = Number(todos[0].id.split("-")[1]);
      const userObj = {
        id: userId,
        name: `User ${userId}`,
        numTodosCompleted: completedTodoCount,
      };

      result.push(userObj);
      return result;
    }, []);

    console.log(JSON.stringify(finalData, null, 2));
  } catch (err) {
    console.log(err);
  }
}

getUserToDos();
