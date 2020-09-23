module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        title: { type: String, default: '' },
        desc: { type: String, default: '' },
        owner: { type: String, default: '' },
        status: { type: String, default: '' },
        country: { type: String, default: '' },
        ownerType: { type: String, default: '' },
        address: { type: String, default: '' },
        imgPath: [String]
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const Venue = mongoose.model("Venue", schema);

    //to create a dummy venue resource
    // Venue.find({title: 'dummy'}).then(function (docs) {
    //     if (docs.length === 0) {
    //         Venue.create({ title: 'dummy', status:'active'});
    //     }
    //   });

    return Venue;
  };