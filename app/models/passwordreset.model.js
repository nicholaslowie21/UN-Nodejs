module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        token: { type: String, default: '' },
        type: { type: String, default: '' },
        accountId: { type: String, default: '' },
        expiredAt: Date,
        status: { type: String, default: '' }
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const PasswordReset = mongoose.model("PasswordReset", schema);

    return PasswordReset;
  };