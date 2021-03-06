/*
用来定义路由的路由器模块
 */
const express = require('express')
const md5 = require('blueimp-md5')

const UserModel = require('../models/UserModel')
const SpeciesModel = require('../models/SpeciesModel')
const pokemonCatchModel = require('../models/PokemonCatchModel')
const PokemonModel = require('../models/PokemonModel')
const RoleModel = require('../models/RoleModel')


// 得到路由器对象
const router = express.Router()
// console.log('router', router)

// 指定需要过滤的属性
const filter = { password: 0, __v: 0 }


// 登陆
router.post('/login', (req, res) => {
  const { username, password } = req.body
  // 根据username和password查询数据库users, 如果没有, 返回提示错误的信息, 如果有, 返回登陆成功信息(包含user)
  UserModel.findOne({ username, password: md5(password) })
    .then(user => {
      if (user) { // 登陆成功
        // 生成一个cookie(userid: user._id), 并交给浏览器保存
        res.cookie('userid', user._id, { maxAge: 1000 * 60 * 60 * 24 })
        if (user.role_id) {
          RoleModel.findOne({ _id: user.role_id })
            .then(role => {
              user._doc.role = role
              console.log('role user', user)
              res.send({ status: 0, data: user })
            })
        } else {
          user._doc.role = { menus: [] }
          // 返回登陆成功信息(包含user)
          res.send({ status: 0, data: user })
        }

      } else {// 登陆失败
        res.send({ status: 1, msg: '用户名或密码不正确!' })
      }
    })
    .catch(error => {
      console.error('登陆异常', error)
      res.send({ status: 1, msg: '登陆异常, 请重新尝试' })
    })
})

// 添加用户
router.post('/manage/user/add', (req, res) => {
  // 读取请求参数数据
  const { username, password } = req.body
  // 处理: 判断用户是否已经存在, 如果存在, 返回提示错误的信息, 如果不存在, 保存
  // 查询(根据username)
  UserModel.findOne({ username })
    .then(user => {
      // 如果user有值(已存在)
      if (user) {
        // 返回提示错误的信息
        res.send({ status: 1, msg: '此用户已存在' })
        return new Promise(() => {
        })
      } else { // 没值(不存在)
        // 保存
        return UserModel.create({ ...req.body, password: md5(password || '123') })
      }
    })
    .then(user => {
      // 返回包含user的json数据
      res.send({ status: 0, data: user })
    })
    .catch(error => {
      console.error('注册异常', error)
      res.send({ status: 1, msg: '添加用户异常, 请重新尝试' })
    })
})


// 更新用户
router.post('/manage/user/update', (req, res) => {
  const user = req.body
  UserModel.findOneAndUpdate({ _id: user._id }, user)
    .then(oldUser => {
      const data = Object.assign(oldUser, user)
      // 返回
      res.send({ status: 0, data })
    })
    .catch(error => {
      console.error('更新用户异常', error)
      res.send({ status: 1, msg: '更新用户异常, 请重新尝试' })
    })
})

// 删除用户
router.post('/manage/user/delete', (req, res) => {
  const { userId } = req.body
  UserModel.deleteOne({ _id: userId })
    .then((doc) => {
      res.send({ status: 0 })
    })
})


// 获取所有用户列表
router.get('/manage/user/list', (req, res) => {
  UserModel.find({ username: { '$ne': 'admin' } })
    .then(users => {
      RoleModel.find().then(roles => {
        res.send({ status: 0, data: { users, roles } })
      })
    })
    .catch(error => {
      console.error('获取用户列表异常', error)
      res.send({ status: 1, msg: '获取用户列表异常, 请重新尝试' })
    })
})

//获取抓捕的宝可梦
router.post('/manage/pokemonCatch0', (req, res) => {
  const { rarity0 } = req.body
  pokemonCatchModel.aggregate().match({
    'rarity': '0'
  }).sample(rarity0).then((pokemons) => {
    res.send(pokemons);
  });
})

router.post('/manage/pokemonCatch1', (req, res) => {
  const { rarity1 } = req.body
  pokemonCatchModel.aggregate().match({
    'rarity': '1'
  }).sample(rarity1).then((pokemons) => {
    res.send(pokemons);
  });
})

router.post('/manage/pokemonCatch2', (req, res) => {
  const { rarity2 } = req.body
  pokemonCatchModel.aggregate().match({
    'rarity': '2'
  }).sample(rarity2).then((pokemons) => {
    res.send(pokemons);
  });
})

// 添加分类
router.post('/manage/species/add', (req, res) => {
  const { speciesName, parentId } = req.body
  SpeciesModel.create({ name: speciesName, parentId: parentId || '0' })
    .then(species => {
      res.send({ status: 0, data: species })
    })
    .catch(error => {
      console.error('添加分类异常', error)
      res.send({ status: 1, msg: '添加分类异常, 请重新尝试' })
    })
})

// 获取分类列表
router.get('/manage/species/list', (req, res) => {
  const parentId = req.query.parentId || '0'
  SpeciesModel.find({ parentId })
    .then(species => {
      res.send({ status: 0, data: species })
    })
    .catch(error => {
      console.error('获取分类列表异常', error)
      res.send({ status: 1, msg: '获取分类列表异常, 请重新尝试' })
    })
})

// 更新分类名称
router.post('/manage/species/update', (req, res) => {
  const { speciesId, speciesName } = req.body
  SpeciesModel.findOneAndUpdate({ _id: speciesId }, { name: speciesName })
    .then(oldCategory => {
      res.send({ status: 0 })
    })
    .catch(error => {
      console.error('更新分类名称异常', error)
      res.send({ status: 1, msg: '更新分类名称异常, 请重新尝试' })
    })
})

// 根据分类ID获取分类
router.get('/manage/species/info', (req, res) => {
  const speciesId = req.query.speciesId
  SpeciesModel.findOne({ _id: speciesId })
    .then(species => {
      res.send({ status: 0, data: species })
    })
    .catch(error => {
      console.error('获取分类信息异常', error)
      res.send({ status: 1, msg: '获取分类信息异常, 请重新尝试' })
    })
})


// 添加宝可梦
router.post('/manage/pokemon/add', (req, res) => {
  const pokemon = req.body
  PokemonModel.create(pokemon)
    .then(pokemon => {
      res.send({ status: 0, data: pokemon })
    })
    .catch(error => {
      console.error('添加宝可梦异常', error)
      res.send({ status: 1, msg: '添加宝可梦异常, 请重新尝试' })
    })
})

// 更新宝可梦
router.post('/manage/pokemon/update', (req, res) => {
  const pokemon = req.body
  PokemonModel.findOneAndUpdate({ _id: pokemon._id }, pokemon)
    .then(oldPokemon => {
      res.send({ status: 0 })
    })
    .catch(error => {
      console.error('更新宝可梦异常', error)
      res.send({ status: 1, msg: '更新宝可梦异常, 请重新尝试' })
    })
})

// 获取宝可梦分页列表
router.get('/manage/pokemon/list', (req, res) => {
  const { pageNum, pageSize } = req.query
  PokemonModel.find({})
    .then(pokemon => {
      res.send({ status: 0, data: pageFilter(pokemon, pageNum, pageSize) })
    })
    .catch(error => {
      console.error('获取宝可梦列表异常', error)
      res.send({ status: 1, msg: '获取宝可梦列表异常, 请重新尝试' })
    })
})

// 搜索宝可梦列表
router.get('/manage/pokemon/search', (req, res) => {
  const { pageNum, pageSize, searchName, pokemonName, pokemonDesc } = req.query
  let contition = {}
  if (pokemonName) {
    contition = { name: new RegExp(`^.*${pokemonName}.*$`) }
  } else if (pokemonDesc) {
    contition = { desc: new RegExp(`^.*${pokemonDesc}.*$`) }
  }
  PokemonModel.find(contition)
    .then(pokemons => {
      res.send({ status: 0, data: pageFilter(pokemons, pageNum, pageSize) })
    })
    .catch(error => {
      console.error('搜索宝可梦列表异常', error)
      res.send({ status: 1, msg: '搜索宝可梦列表异常, 请重新尝试' })
    })
})


// 更新宝可梦状态(上架/下架)
router.post('/manage/pokemon/updateStatus', (req, res) => {
  const { pokemonId, status } = req.body
  PokemonModel.findOneAndUpdate({ _id: pokemonId }, { status })
    .then(oldProduct => {
      res.send({ status: 0 })
    })
    .catch(error => {
      console.error('更新宝可梦状态异常', error)
      res.send({ status: 1, msg: '更新宝可梦状态异常, 请重新尝试' })
    })
})


// 添加角色
router.post('/manage/role/add', (req, res) => {
  const { roleName } = req.body
  RoleModel.create({ name: roleName })
    .then(role => {
      res.send({ status: 0, data: role })
    })
    .catch(error => {
      console.error('添加角色异常', error)
      res.send({ status: 1, msg: '添加角色异常, 请重新尝试' })
    })
})

// 获取角色列表
router.get('/manage/role/list', (req, res) => {
  RoleModel.find()
    .then(roles => {
      res.send({ status: 0, data: roles })
    })
    .catch(error => {
      console.error('获取角色列表异常', error)
      res.send({ status: 1, msg: '获取角色列表异常, 请重新尝试' })
    })
})

// 更新角色(设置权限)
router.post('/manage/role/update', (req, res) => {
  const role = req.body
  role.auth_time = Date.now()
  RoleModel.findOneAndUpdate({ _id: role._id }, role)
    .then(oldRole => {
      // console.log('---', oldRole._doc)
      res.send({ status: 0, data: { ...oldRole._doc, ...role } })
    })
    .catch(error => {
      console.error('更新角色异常', error)
      res.send({ status: 1, msg: '更新角色异常, 请重新尝试' })
    })
})


/*
得到指定数组的分页信息对象
 */
function pageFilter(arr, pageNum, pageSize) {
  pageNum = pageNum * 1
  pageSize = pageSize * 1
  const total = arr.length
  const pages = Math.floor((total + pageSize - 1) / pageSize)
  const start = pageSize * (pageNum - 1)
  const end = start + pageSize <= total ? start + pageSize : total
  const list = []
  for (var i = start; i < end; i++) {
    list.push(arr[i])
  }

  return {
    pageNum,
    total,
    pages,
    pageSize,
    list
  }
}

require('./file-upload')(router)

module.exports = router