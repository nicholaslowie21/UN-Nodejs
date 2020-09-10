module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        title: String,
        desc: String,
        host: String,
        hostType: String,
        status: String,
        rating: Number,
        region: String,
        admins: [String],
        contributions: [String],
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

    //to create a dummy project
    Project.find({title: 'dummy'}).then(function (docs) {
      if (docs.length === 0) {
          Project.create({ title: 'dummy', status:'ongoing'});
      }
    });

    return Project;
  };