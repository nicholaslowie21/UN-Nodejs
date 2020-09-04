module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        name: String,
        address: String,
        username: String,
        email: String,
        phone: String,
        status: String,
        bio: String,
        isVerified: Boolean,
        profilePic: String,
        password: String,
        salt: String,
        members: [String],
        projects: [String],
        SDGs: [Number]
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const Institution  = mongoose.model("Institution", schema);
    

    return Institution;
  };