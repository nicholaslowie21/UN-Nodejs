module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        title: { type: String, default: '' },
        desc: { type: String, default: '' },
        accountId: { type: String, default: '' },
        accountType: { type: String, default: '' },
        status: { type: String, default: 'active' },
        projectId: { type: String, default: '' },
        imgPath: { type: String, default: '' }
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const ProjectPost = mongoose.model("ProjectPost", schema);


    return ProjectPost;
  };