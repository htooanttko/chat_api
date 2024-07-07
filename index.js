import express from "express";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3500;

const app = express();

app.use(express.static(path.join(__dirname, "public")));

const expressServer = app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});

let users = [];

const io = new Server(expressServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log(`User ${socket.id} connected`);
  let userData = {
    id: users.length + 1,
    socket_id: socket.id,
  };
  users.push(userData);

  console.log("on connect", users);

  socket.on("message", (data) => {
    io.emit("message", buildMsg(data, userData.id));
  });

  socket.on("disconnect", () => {
    users = users.filter((user) => user.socket_id != socket.id);
    console.log(`User ${socket.id} disconnected`);
    console.log("on disconnect", users);
  });
});

function buildMsg(text, id) {
  return {
    id,
    text,
    time: new Intl.DateTimeFormat("default", {
      hour: "numeric",
      minute: "numeric",
    }).format(new Date()),
  };
}
