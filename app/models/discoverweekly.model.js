module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        accountId: { type: String, default: '' },
        accountType: { type: String, default: '' },
        projectIds: [String]
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const DiscoverWeekly = mongoose.model("DiscoverWeekly", schema);

    return DiscoverWeekly;
  };