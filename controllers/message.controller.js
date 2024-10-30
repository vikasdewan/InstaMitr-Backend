import { Conversation } from "../models/conversation.model.js";

//controller for chat system in the app
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;
    const { message } = req.body;

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });
  } catch (error) {
    console.log(error);
  }
};
