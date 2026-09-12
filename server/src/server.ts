import http from "http";
import app from "./app.js";
import { Server } from "socket.io";

const PORT = 5000;

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join-project", (projectId: string) => {
    socket.join(`project:${projectId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Velozity API running on http://localhost:${PORT}`);
});

export { io };