/*
cron "0 9 * * *" autoSignin.js, tag=阿里云盘签到
*/

const axios = require('axios')
const { initInstance, getEnv, updateCkEnv } = require('./qlApi.js')
const notify = require('./sendNotify')
const qs = require('qs')
const dayjs = require('dayjs')

const scheduledoctorlistUrl =
  'https://hlwyyapi.wuaitec.com/api/register/scheduledoctorlist?_route=h320125&'

//签到列表
async function getScheduledoctorList(scheduleDate) {
  const { token } = getRefreshToken()
  if (!token) {
    throw new Error('token 获取失败')
  }
  let params = qs.stringify({
    hisId: '320125',
    platformId: '320125',
    login_access_token: token,
    platformSource: '3',
    subSource: '2',
    deptId: '61004',
    appFlag: '2',
    scheduleDate: scheduleDate,
    preciseReg: '',
    registerType: '',
    appointFlag: '2'
  })

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://hlwyyapi.wuaitec.com/api/register/scheduledoctorlist?_route=h320125&',
    headers: {
      'has-id': '320125',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: params
  }

  const res = await axios.request(config)
  const { data } = res
  if (data.code !== 0) {
    console.log('获取医生排班异常')
  }
  data.data.doctorList.forEach(d => {
    console.log(
      `【科室】：${d.deptName}，【号】：${d.doctorName}，【余号】：${d.leftSource} `
    )
  })
}

// 获取环境变量
async function getRefreshToken() {
  let instance = null
  try {
    instance = await initInstance()
  } catch (e) {}

  let token = process.env.nkyyToken
  try {
    if (instance) token = await getEnv(instance, 'nkyyToken')
  } catch (e) {}

  return {
    instance,
    token
  }
}

async function main() {
  const messages = []
  const now = dayjs()
  for (let i = 0; i < 7; i++) {
    const date = now.add(i, 'day').format('YYYY-MM-DD')
    try {
      await getScheduledoctorList(date)
    } catch (error) {}
  }
}

main()
