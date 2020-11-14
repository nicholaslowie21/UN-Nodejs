module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        desc: { type: String, default: '' },
        projectId: { type: String, default: '' },
        targetId: { type: String, default: '' },
        targetType: { type: String, default: '' },
        creatorId: { type: String, default: '' },
        creatorType: { type: String, default: '' },
        status: { type: String, default: '' }
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const Testimonial = mongoose.model("Testimonial", schema);

    return Testimonial;
  };