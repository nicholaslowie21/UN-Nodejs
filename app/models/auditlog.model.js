module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        action: { type: String, default: '' },
        targetType: { type: String, default: '' },
        targetId: { type: String, default: '' }
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const AuditLog = mongoose.model("AuditLog", schema);

    return AuditLog;
  };