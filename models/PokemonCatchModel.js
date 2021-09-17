const pokemonList =require('../data/pokemonListInit')
/*
能操作pokemonCatch集合数据的Model
 */
// 1.引入mongoose
const mongoose = require('mongoose')

// 2.字义Schema(描述文档结构)
const pokemonCatchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rarity: { type: String, required: true, default: '0' }
})

// 3. 定义Model(与集合对应, 可以操作集合)
const pokemonCatchModel = mongoose.model('pokemonCatch', pokemonCatchSchema)

pokemonCatchModel.findOne({ name: '皮卡丘' }).then(pokemon => {
  if (!pokemon) {
    pokemonCatchModel.create(pokemonList)
      .then(pokemon => {
        console.log('初始化抓捕宝可梦数据完成')
      })
  }
})


// 4. 向外暴露Model
module.exports = pokemonCatchModel