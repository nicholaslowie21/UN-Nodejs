module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        paidResourceId: { type: String, default: '' },
        status: { type: String, default: '' },
        projectId: { type: String, default: '' },
        buyerId: { type: String, default: '' },
        buyerType: { type: String, default: '' },
        cancelType: { type: String, default: '' }
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const PaidRequest = mongoose.model("PaidRequest", schema);

    return PaidRequest;
  };