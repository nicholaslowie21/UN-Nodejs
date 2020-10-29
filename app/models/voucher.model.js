module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        rewardId: { type: String, default: '' },
        code: { type: String, default: '' },
        status: { type: String, default: '' },
        userId: { type: String, default: '' },
        claimedAt: Date,
        endDate: Date
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const Voucher = mongoose.model("Voucher", schema);

    return Voucher;
  };