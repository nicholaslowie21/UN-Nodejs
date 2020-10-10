module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        comment: { type: String, default: '' },
        postId: { type: String, default: '' },
        accountId: { type: String, default: '' },
        accountType: { type: String, default: '' },
        status: { type: String, default: 'active' }
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const PostComment = mongoose.model("PostComment", schema);


    return PostComment
  };