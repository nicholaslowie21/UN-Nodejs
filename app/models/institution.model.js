module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        name: { type: String, default: '' },
        username: { type: String, default: '' },
        address: { type: String, default: '' },
        email: { type: String, default: '' },
        phone: { type: String, default: '' },
        status: { type: String, default: '' },
        bio: { type: String, default: '' },
        isVerified: { type: Boolean, default: false },
        profilePic: { type: String, default: '' },
        country: { type: String, default: '' },
        password: { type: String, default: '' },
        salt: { type: String, default: '' },
        website: { type: String, default: '' },
        ionicImg: { type: String, default: '' },
        verifyFilePath: { type: String, default: '' },
        members: [String],
        projects: [String],
        SDGs: [Number],
        points: { type: Number, default: 0 },
        tier: { type: String, default: '' },
        targets: [String]
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