module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        SDG: { type: Number, default: 1 },
        desc: { type: String, default: '' },
        targetCode: { type: String, default: '' }
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const Target = mongoose.model("Target", schema);

    return Target;
  };