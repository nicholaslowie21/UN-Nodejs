module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        title: { type: String, default: '' },
        desc: { type: String, default: '' },
        status: { type: String, default: 'progress' },
        type: { type: String, default: '' },
        code: { type: String, default: '' },
        total: { type: Number, default: 0 },
        pendingSum: { type: Number, default: 0 },
        receivedSum: { type: Number, default: 0 },
        completion: { type: Number, default: 0 },
        projectId: { type: String, default: '' }
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