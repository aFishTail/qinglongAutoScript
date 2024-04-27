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
  const messages = []
  const { token } = await getRefreshToken()
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
    url: scheduledoctorlistUrl,
    headers: {
      'has-id': '320125',
      'Content-Type': 'application/x-www-form-urlencoded',
      referer:
        'https://servicewechat.com/wx9adf4bd410073be5/11/page-frame.html',
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x6309092b) XWEB/8555',
      client: 'patient',
      'hc-src-hisid': '320125'
    },
    data: params
  }

  const res = await axios.request(config)
  const { data } = res
  if (data.code !== 0) {
    console.log('获取医生排班异常')
    process.exit(1)
  }
  console.log('data', data)
  const doctorList = data.data.doctorList
  if (!doctorList || doctorList.length === 0) {
    const msg = `【日期】:${scheduleDate} 无排班`
    console.log(msg)
    messages.push(msg)
  } else {
    data.data.doctorList.forEach(d => {
      const msg = `【日期】:${scheduleDate} 【科室】：${d.deptName}，【号】：${d.doctorName}，【余号】：${d.leftSource} `
      console.log(msg)
      messages.push(msg)
    })
  }
  return messages
}

// 获取环境变量
async function getRefreshToken() {
  // let instance = null
  // try {
  //   instance = await initInstance()
  // } catch (e) {}

  let token = process.env.nkyyToken || '1714186734958-2B4B63AF24AEED821480E6'
  // try {
  //   if (instance) token = await getEnv(instance, 'nkyyToken')
  // } catch (e) {}

  return {
    // instance,
    token
  }
}

async function main() {
  const messages = []
  const now = dayjs()
  for (let i = 0; i < 7; i++) {
    const date = now.add(i, 'day').format('YYYY-MM-DD')
    try {
      const msgs = await getScheduledoctorList(date)
      messages.push(...msgs)
      console.log(messages)
      notify.sendNotify('nk', messages.join('\n'))
    } catch (error) {
      console.log('error', error)
    }
  }
}

main()
