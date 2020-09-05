module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        id: String,
        status: String
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