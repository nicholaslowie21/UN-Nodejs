module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        userId: { type: String, default: '' },
        status: { type: String, default: '' },
        imgPath: { type: String, default: '' },
        country: { type: String, default: '' }
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const VerifyRequest = mongoose.model("VerifyRequest", schema);

    return VerifyRequest;
  };