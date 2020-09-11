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
        isVerified: String,
        profilePic: String,
        country: String,
        website: String,
        points: Number,
        salt: String,
        gender: String,
        skills: [String],
        institutionIds: [String],
        projects: [String],
        badges: [String],
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
          User.create({ username: 'superadmin', name:'superadmin', email:'superadmin@email.com', bio: '', occupation:'', isVerified:'false', profilePic: '', country: '',points:0, wallet:0, gender:'', website:'' ,status:'active' ,password: '1601c7d4ebcaa72ae9abc3a1eec24196', salt: 'UH1GR6hl', role:'adminlead' });
      }
    });

    return User;
  };