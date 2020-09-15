module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        title: { type: String, default: '' },
        desc: { type: String, default: '' },
        owner: { type: String, default: '' },
        status: { type: String, default: '' },
        projectIds: { type: String, default: '' },
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
  
    const Item = mongoose.model("Item", schema);

    //to create a dummy Item resource
    Item.find({title: 'dummy'}).then(function (docs) {
        if (docs.length === 0) {
            Item.create({ title: 'dummy', status:'active'});
        }
      });

    return Item;
  };