module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        title: { type: String, default: '' },
        summary: { type: String, default: '' },
        reportType: { type: String, default: '' },
        targetId: { type: String, default: '' },
        status: { type: String, default: '' },
        country: { type: String, default: '' },
        reporterId: { type: String, default: '' },
        reporterType: { type: String, default: '' }
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const Report = mongoose.model("Report", schema);

    return Report;
  };