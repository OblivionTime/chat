/*
 * @Description:
 * @Version: 2.0
 * @Autor: solid
 * @Date: 2021-12-23 22:30:23 +0800
 * @LastEditors: solid
 * @LastEditTime: 2022-06-01 11:02:10
 */
import axios from 'axios'
import store from '@/store'
import router from '../router'
import { Message } from 'element-ui'
var baseURL = `${store.getters.ipaddress}/api/chat/v1/`
const service = axios.create({
	baseURL: baseURL,
	// withCredentials: true,
	timeout: 50000
})

// request interceptor
service.interceptors.request.use(
	(config) => {
		// config.url

		if (store.getters.token) {
			config.headers['authorization'] = store.getters.token
		}
		return config
	},
	(error) => {
		// do something with request error
		return Promise.reject(error)
	}
)

// response interceptor
service.interceptors.response.use(
	/**
	 * If you want to get http information such as headers or status
	 * Please return  response => response
	 */

	/**
	 * Determine the request status by custom code
	 * Here is just an example
	 * You can also judge the status by HTTP Status Code
	 */
	response => {
		// if the custom code is not 20000, it is judged as an error.
		if (response.data.code == 401) {
			Message({
				message: response.data.message,
				type: 'error',
				duration: 1.5 * 1000,
				onClose: function () {
					setTimeout(() => {
						router.push("/")
					}, 1.5 * 1000);
				}
			})
		} else {
			return response.data
		}
	},
	error => {
		console.log(error);
	}
)

export default service
