module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        title: { type: String, default: '' },
        desc: { type: String, default: '' },
        owner: { type: String, default: '' },
        status: { type: String, default: '' },
        country: { type: String, default: '' },
        ownerType: { type: String, default: '' }
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const Manpower = mongoose.model("Manpower", schema);

    //to create a dummy manpower
    // Manpower.find({title: 'dummy'}).then(function (docs) {
    //   if (docs.length === 0) {
    //       Manpower.create({ title: 'dummy', status:'active'});
    //   }
    // });

    return Manpower;
  };