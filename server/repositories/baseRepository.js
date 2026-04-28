export class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findById(id) {
    return await this.model.findById(id);
  }

  async findOne(filter) {
    return await this.model.findOne(filter);
  }

  async find(filter = {}, options = {}) {
    return await this.model.find(filter, null, options);
  }

  async create(data) {
    return await this.model.create(data);
  }

  async updateById(id, data) {
    return await this.model.findByIdAndUpdate(id, data, { new: true });
  }

  async updateOne(filter, data) {
    return await this.model.findOneAndUpdate(filter, data, { new: true });
  }

  async deleteById(id) {
    return await this.model.findByIdAndDelete(id);
  }

  async deleteOne(filter) {
    return await this.model.findOneAndDelete(filter);
  }

  async count(filter = {}) {
    return await this.model.countDocuments(filter);
  }

  async exists(filter) {
    return await this.model.exists(filter);
  }
}
