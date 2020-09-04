module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        title: String,
        desc: String,
        host: String,
        hostType: String,
        status: String,
        rating: Number,
        admins: [String],
        contributors: [String],
        SDGs: [Number]
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const Project = mongoose.model("Project", schema);

    return Project;
  };