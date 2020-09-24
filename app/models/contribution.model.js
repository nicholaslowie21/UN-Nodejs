module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        projectId: { type: String, default: '' },
        needId: { type: String, default: '' },
        requestId: { type: String, default: '' },
        requestType: { type: String, default: '' },
        resType: { type: String, default: '' },
        rating: { type: Number, default: 1 },
        contributor: { type: String, default: '' },
        contributorType: { type: String, default: '' },
        status: { type: String, default: 'active' }
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const Contribution = mongoose.model("Contribution", schema);

    return Contribution;
  };