module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        name: String,
        username: String,
        email: String,
        password: String,
        role: String,
        status: String,
        bio: String,
        occupation: String,
        isVerified: Boolean,
        profilePic: String,
        country: String,
        points: Number
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const Tutorial = mongoose.model("users", schema);
    return Tutorial;
  };