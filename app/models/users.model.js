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

    //to create a super user
    //password: SuperAdminPass@123
    User.find({username: 'superadmin'}).then(function (docs) {
      if (docs.length === 0) {
          User.create({ username: 'superadmin', password: '1601c7d4ebcaa72ae9abc3a1eec24196', salt: 'UH1GR6hl', role:'adminlead' });
      }
  });

    return User;
  };