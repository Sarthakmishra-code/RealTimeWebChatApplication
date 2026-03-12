import Message from "../models/message.model.js";

const userSocketMap = {};

const setupSocket = (io) => {
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      userSocketMap[userId] = socket.id;
      io.emit("onlineUsers", Object.keys(userSocketMap));
    }

    socket.on("sendMessage", async ({ senderId, receiverId, text }) => {
      try {
        const message = await Message.create({ senderId, receiverId, text });

        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("newMessage", message);
        }

        socket.emit("newMessage", message);
      } catch (error) {
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("disconnect", () => {
      if (userId) {
        delete userSocketMap[userId];
        io.emit("onlineUsers", Object.keys(userSocketMap));
      }
    });
  });
};

export default setupSocket;