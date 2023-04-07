/*
 * @Description: 
 * @Version: 1.0
 * @Autor: solid
 * @Date: 2022-05-17 14:17:49
 * @LastEditors: solid
 * @LastEditTime: 2022-05-31 18:50:40
 */

import {
	getUser,
	setUser,
	removeUser,
	getToken,
	setToken,
	removeToken,

} from '@/utils/cookie';
const user = {
	state: {
		token: getToken() ? getToken() : '',
		userInfo: getUser() ? getUser() : '',
	},

	mutations: {
		SET_TOKEN: (state, token) => {
			state.token = token
		},
		SET_USER: (state, user) => {
			state.userInfo = user
		},
	},
	actions: {
		// 登录
		Login({
			commit
		}, userInfo) {
			commit('SET_TOKEN', userInfo.token)
			commit('SET_USER', userInfo.info)
			setToken(userInfo.token)
			setUser(userInfo.info)
		},
		// 登出
		Logout({
			commit
		}) {
			return new Promise((resolve) => {
				removeToken()
				removeUser()
				commit('SET_TOKEN', '')
				commit('SET_USER', '')
				window.localStorage.removeItem('auto_login')
				window.localStorage.removeItem('remember_password')
				window.localStorage.removeItem('last_password')
				resolve()
			})
		},
		resetToken({
			commit
		}) {
			return new Promise((resolve) => {
				removeToken()
				removeUser()
				commit('SET_TOKEN', '')
				commit('SET_USER', '')
				window.localStorage.removeItem('auto_login')
				window.localStorage.removeItem('remember_password')
				window.localStorage.removeItem('last_password')
				resolve()
			})
		},
		//修改信息
		updateUserInfo({
			commit
		}, userInfo) {
			commit('SET_USER', userInfo)
			setUser(userInfo)
		},
	}
}
export default user
