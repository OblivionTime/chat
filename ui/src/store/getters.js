/*
 * @Description: 
 * @Version: 1.0
 * @Autor: solid
 * @Date: 2022-05-17 12:45:40
 * @LastEditors: solid
 * @LastEditTime: 2022-05-31 18:50:55
 */
const getters = {
  token: state => state.user.token,
  userInfo: state => state.user.userInfo,
  ipaddress: state => state.user.ipaddress,
  proxyaddress: state => state.user.proxyaddress,
}
export default getters
