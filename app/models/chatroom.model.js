module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        chatType: { type: String, default: 'normal' },
        status: { type: String, default: 'open' },
        user1username: { type: String, default: '' },
        user2username: { type: String, default: '' },
        user1type: { type: String, default: '' },
        user2type: { type: String, default: '' },
        user1id: { type: String, default: '' },
        user2id: { type: String, default: '' },
        user1read: { type: Boolean, default: true },
        user2read: { type: Boolean, default: true },
        lastMessage: { type: String, default: '' }
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const ChatRoom = mongoose.model("ChatRoom", schema);

    return ChatRoom;
  };