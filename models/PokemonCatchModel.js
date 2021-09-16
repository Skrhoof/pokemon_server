import pokemonList from './pokemonListInit'
/*
能操作pokemonCatch集合数据的Model
 */
// 1.引入mongoose
const mongoose = require('mongoose')

// 2.字义Schema(描述文档结构)
const pokemonCatchSchema = new mongoose.Schema({
  name: {type: String, required: true},
  rarity: {type: String, required: true, default: '0'}
})

// 3. 定义Model(与集合对应, 可以操作集合)
const pokemonCatchModel = mongoose.model('pokemonCatch', pokemonCatchSchema)

pokemonCatchModel.create(pokemonList)
      .then(user => {
        console.log('初始化用户: 用户名: admin 密码为: admin')
      })

// 4. 向外暴露Model
module.exports = pokemonCatchModel