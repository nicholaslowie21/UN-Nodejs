module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        accountId: { type: String, default: '' },
        accountType: { type: String, default: '' },
        verificationFile: { type: String, default: '' },
        country: {type: String, default:' '},
        status: { type: String, default: 'pending' }
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const AccountClaim = mongoose.model("AccountClaim", schema);

    return AccountClaim;
  };