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

        // Serialize to plain object so ObjectIds become strings
        const payload = {
          _id: message._id.toString(),
          senderId: message.senderId.toString(),
          receiverId: message.receiverId.toString(),
          text: message.text,
          createdAt: message.createdAt,
          updatedAt: message.updatedAt,
        };

        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("newMessage", payload);
        }

        socket.emit("newMessage", payload);
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