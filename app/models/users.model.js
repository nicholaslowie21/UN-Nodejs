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
        points: Number,
        salt: String,
        institutionIds: [String],
        projects: [String],
        badgePath: String,
        wallet: Number,
        SDGs: [Number]
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const User = mongoose.model("User", schema);
    User.find({username: 'superadmin'}).then(function (docs) {
      if (docs.length === 0) {
          User.create({ username: 'superadmin', password: 'SuperAdminPass@123' });
      }
  });

    return User;
  };