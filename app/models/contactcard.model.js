module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        institutionId: { type: String, default: '' },
        targetId: { type: String, default: '' },
        targetType: { type: String, default: '' },
        ownerId: { type: String, default: '' },
        ownerType: { type: String, default: '' },
        status: { type: String, default: '' }
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const ContactCard = mongoose.model("ContactCard", schema);

    return ContactCard;
  };