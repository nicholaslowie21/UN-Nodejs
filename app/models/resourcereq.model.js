module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        projectId: { type: String, default: '' },
        needId: { type: String, default: '' },
        resourceId: { type: String, default: '' },
        resType: { type: String, default: '' },
        status: { type: String, default: '' },
        desc: { type: String, default: '' },
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const ResourceReq = mongoose.model("ResourceReq", schema);

    return ResourceReq;
  };