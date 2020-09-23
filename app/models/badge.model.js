module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        title: { type: String, default: '' },
        description: { type: String, default: '' },
        imgPath: { type: String, default: '' },
        accountId: { type: String, default: '' },
        accountType: { type: String, default: '' },
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const Badge = mongoose.model("Badge", schema);

    //to create a dummy badge
    // Badge.find({title: 'dummy'}).then(function (docs) {
    //   if (docs.length === 0) {
    //       Badge.create({ title: 'dummy'});
    //   }
    // });
    return Badge;
  };