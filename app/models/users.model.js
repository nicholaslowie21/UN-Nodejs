module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        name: { type: String, default: '' },
        username: { type: String, default: '' },
        email: { type: String, default: '' },
        password: { type: String, default: '' },
        role: { type: String, default: '' },
        status: { type: String, default: '' },
        bio: { type: String, default: '' },
        occupation: { type: String, default: '' },
        isVerified: { type: String, default: '' },
        profilePic: { type: String, default: '' },
        country: { type: String, default: '' },
        website: { type: String, default: '' },
        points: { type: Number, default: 0 },
        salt: { type: String, default: '' },
        salutation: { type: String, default: '' },
        ionicImg: { type: String, default: '' },
        skills: [String],
        institutionIds: [String],
        projects: [String],
        wallet: { type: Number, default: 0 },
        SDGs: [Number],
        institutionChoice:{ type: String, default: '' },
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
  
    const User = mongoose.model("User", schema);

    //to create a super user
    // //password: SuperAdminPass@123
    // User.find({username: 'superadmin'}).then(function (docs) {
    //   if (docs.length === 0) {
    //       User.create({ username: 'superadmin', name:'superadmin', email:'superadmin@email.com', bio: '', occupation:'', isVerified:'false', profilePic: '', country: '',points:0, wallet:0, gender:'', website:'' ,status:'active' ,password: '1601c7d4ebcaa72ae9abc3a1eec24196', salt: 'UH1GR6hl', role:'adminlead' });
    //   }
    // });

    return User;
  };