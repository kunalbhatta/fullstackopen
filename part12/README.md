# Part 12 — Containers

The [Todo app](todo-app) uses Express, MongoDB, Redis and React. The [Phonebook](my-app) uses the existing Part 2 frontend and Part 3 API as the application to containerize. Each directory has a development topology with bind mounts and a production topology with an Nginx reverse proxy.

From either directory, run `docker compose up --build` for production or `docker compose -f docker-compose.dev.yml up --build` for hot reload. The Todo app is at localhost ports 8080 and 8081, and Phonebook is at 8090 and 8091. Use `docker compose down` with the same Compose file to stop the stack. Database data persists in the named volumes.

## Container console exercises

These are repeatable commands for recording the interactive exercises on a machine with Docker. Start `script -a exercise12_N.txt` before each session and exit it after the final command.

- **12.1** Use your terminal to clone a repository, list the files, and create and read a text file with `printf` and `cat`.
- **12.2** Run `docker run --rm hello-world`, then `docker run --rm -it ubuntu:24.04 bash` to compare a one-shot image with an interactive shell.
- **12.3–12.4** Run `apt-get update`, then install `nano`, `curl`, and `nodejs` in the disposable Ubuntu container. Create a script and run it with `node`. Open another terminal, use `docker ps` and `docker exec -it CONTAINER bash`, then inspect the files you created.
- **12.5–12.7** Build and run the Node backend image. Start it with MongoDB and use GET and PUT on `/api/todos/:id` through the proxy.
- **12.8** Run `docker compose exec mongo mongosh todos`, then `show collections`, `db.todos.find()` and `db.todos.insertOne({text:"Add through mongosh",done:false})`. Refresh the app to see the new record.
- **12.9–12.12** Create a todo and check `/api/statistics`. Run `docker compose exec redis redis-cli`, then `SCAN 0`, `GET added_todos`, `SET added_todos 9001`, and `GET added_todos` after adding another todo. Try `DEL added_todos`; the next addition starts the counter again. Restart Redis and compare the value to confirm append-only persistence.
- **12.13–12.22** Run both Compose files for each app. The Todo frontend runs its component test during the production image build.

The [smoke-test workflow](../.github/workflows/part12-containers.yml) checks both Compose modes through the proxy on a runner with Docker.
