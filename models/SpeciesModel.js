/*
能操作categorys集合数据的Model
 */
// 1.引入mongoose
const mongoose = require('mongoose')

// 2.字义Schema(描述文档结构)
const speciesSchema = new mongoose.Schema({
  name: {type: String, required: true},
  parentId: {type: String, required: true, default: '0'}
})

// 3. 定义Model(与集合对应, 可以操作集合)
const SpeciesModel = mongoose.model('species', speciesSchema)

// 4. 向外暴露Model
module.exports = SpeciesModel