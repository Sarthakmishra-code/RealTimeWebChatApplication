import Message from "../models/message.model.js";

export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userId },
        { senderId: userId, receiverId: myId },
      ],
    })
      .sort({ createdAt: 1 })
      .lean();

    // Serialize ObjectIds to strings
    const serialized = messages.map((m) => ({
      ...m,
      _id: m._id.toString(),
      senderId: m.senderId.toString(),
      receiverId: m.receiverId.toString(),
    }));

    res.json(serialized);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching messages" });
  }
};