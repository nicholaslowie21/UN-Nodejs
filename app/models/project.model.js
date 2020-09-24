module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        title: { type: String, default: '' },
        desc: { type: String, default: '' },
        host: { type: String, default: '' },
        hostType: { type: String, default: '' },
        status: { type: String, default: '' },
        rating: { type: Number, default: 1 },
        country: { type: String, default: '' },
        code: { type: String, default: '' },
        imgPath: { type: String, default: '' },
        admins: [String],
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
    // Project.find({title: 'dummy'}).then(function (docs) {
    //   if (docs.length === 0) {
    //       Project.create({ title: 'dummy', status:'ongoing', code:'randomcode'});
    //   }
    // });

    return Project;
  };