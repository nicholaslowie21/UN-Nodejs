module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        title: { type: String, default: '' },
        desc: { type: String, default: '' },
        imgPath: { type: String, default: '' },
        point: { type: Number, default: 0 },
        quota: { type: Number, default: 0 },
        status: { type: String, default: '' },
        endDate: Date,
        country: { type: String, default: '' },
        minTier: { type: String, default: '' },
        sponsorId: { type: String, default: '' },
        sponsorType: { type: String, default: '' },
        claimedNum: { type: Number, default: 0 },
        verifyFile: { type: String, default: '' },
        startDate: Date,
        externalName: { type: String, default: '' }
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const Reward = mongoose.model("Reward", schema);

    return Reward;
  };