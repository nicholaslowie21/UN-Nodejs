module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        title: { type: String, default: '' },
        start: Date,
        end: Date,
        projectId: { type: String, default: '' },
        status: { type: String, default: 'active' },
        eventType: { type: String, default: 'public' }
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const ProjectEvent = mongoose.model("ProjectEvent", schema);

    return ProjectEvent;
  };