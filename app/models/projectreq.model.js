module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        projectId: { type: String, default: '' },
        needId: { type: String, default: '' },
        resourceId: { type: String, default: '' },
        resType: { type: String, default: '' },
        status: { type: String, default: '' },
        ownerId: { type: String, default: '' },
        ownerType: { type: String, default: '' },
        desc: { type: String, default: '' },
        moneySum: { type: Number, default: 0 }
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const ProjectReq = mongoose.model("ProjectReq", schema);

    return ProjectReq;
  };