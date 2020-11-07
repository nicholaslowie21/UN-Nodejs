module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        roomId: { type: String, default: '' },
        message: { type: String, default: '' },
        accountId: { type: String, default: '' },
        accountUsername: { type: String, default: '' },
        accountType: { type: String, default: '' }
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const Chat = mongoose.model("Chat", schema);

    return Chat;
  };