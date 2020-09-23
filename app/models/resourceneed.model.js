module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        title: { type: String, default: '' },
        desc: { type: String, default: '' },
        status: { type: String, default: 'progress' },
        type: { type: String, default: '' },
        code: { type: String, default: '' },
        total: Number,
        pendingSum: Number,
        receivedSum: Number,
        completion: Number,
        projectId: String
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const ResourceNeed = mongoose.model("ResourceNeed", schema);

    return ResourceNeed;
  };