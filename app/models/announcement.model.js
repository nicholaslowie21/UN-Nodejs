module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        title: { type: String, default: '' },
        desc: { type: String, default: '' },
        isDeleted: {type: Boolean, default: false}
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const Announcement = mongoose.model("Announcement", schema);

    return Announcement;
  };