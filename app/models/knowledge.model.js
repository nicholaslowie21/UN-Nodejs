module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        title: { type: String, default: '' },
        desc: { type: String, default: '' },
        status: { type: String, default: '' },
        projectIds: { type: String, default: '' },
        region: { type: String, default: '' },
        owner: [{ theId: String, ownerType: String}],
        attachment: { type: String, default: '' }

      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const Knowledge = mongoose.model("Knowledge", schema);

    //to create a knowledge resource
    // Knowledge.find({title: 'dummy'}).then(function (docs) {
    //     if (docs.length === 0) {
    //         Knowledge.create({ title: 'dummy', status:'active'});
    //     }
    //   });

    return Knowledge;
  };