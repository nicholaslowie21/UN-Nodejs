module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        title: { type: String, default: '' },
        desc: { type: String, default: '' },
        category: { type: String, default: '' },
        status: { type: String, default: '' },
        price: { type: Number, default: 0 },
        owner: { type: String, default: '' },
        ownerType: { type: String, default: '' },
        country: { type: String, default: '' },
        imgPath: [String]
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const PaidResource = mongoose.model("PaidResource", schema);

    return PaidResource;
  };