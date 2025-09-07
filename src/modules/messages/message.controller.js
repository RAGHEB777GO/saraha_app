
import Message from "../../models/message.model.js";


// Send a message
export const sendMessage = async (req, res, next) => {
  try {
    const { receiver, content } = req.body;
    if (!receiver || !content) {
      return res.status(400).json({ message: "Receiver and content are required" });
    }

    const message = await Message.create({
      sender: req.user.id,
      receiver,
      content,
    });

    res.status(201).json({ message: "Message sent", data: message });
  } catch (err) {
    next(err);
  }
};

// Get messages for logged-in user
export const getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({ receiver: req.user.id })
      .populate("sender", "userName email")
      .sort({ createdAt: -1 });

    res.status(200).json({ messages });
  } catch (err) {
    next(err);
  }
};

// Mark message as read
export const markAsRead = async (req, res, next) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    if (!message) return res.status(404).json({ message: "Message not found" });

    res.status(200).json({ message: "Message marked as read", data: message });
  } catch (err) {
    next(err);
  }
};

// Delete a message
export const deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (err) {
    next(err);
  }
};
