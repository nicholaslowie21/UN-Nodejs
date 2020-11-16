module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        title: { type: String, default: '' },
        desc: { type: String, default: '' },
        accountId: { type: String, default: '' },
        accountType: { type: String, default: '' },
        isRead: { type: Boolean, default: true }
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const Notification = mongoose.model("Notification", schema);

    return Notification;
  };