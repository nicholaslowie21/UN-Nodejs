module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        token: String,
        type: String,
        accountId: String,
        expiredAt: Date,
        status: String
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