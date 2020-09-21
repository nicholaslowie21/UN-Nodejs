module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        sum: Number,
        desc: { type: String, default: '' },
        owner: { type: String, default: '' },
        status: { type: String, default: '' },
        region: { type: String, default: '' },
        ownerType: { type: String, default: '' }
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const Money = mongoose.model("Money", schema);

    //to create a dummy money resource
    Money.find({title: 'dummy'}).then(function (docs) {
        if (docs.length === 0) {
            Money.create({ title: 'dummy', status:'active'});
        }
      });

    return Money;
  };