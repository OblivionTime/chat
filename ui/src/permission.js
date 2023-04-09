/*
 * @Description: 
 * @Version: 1.0
 * @Autor: solid
 * @Date: 2022-05-17 12:45:40
 * @LastEditors: solid
 * @LastEditTime: 2022-10-28 21:16:20
 */
import router from './router'
import { getToken } from '@/utils/cookie' // get token from cookie
import store from '@/store'

const whiteList = ['/login'] // no redirect whitelist

router.beforeEach(async (to, from, next) => {
    const hasToken = getToken()
    if (hasToken) {
        if (to.path === '/login') {
            // if is logged in, redirect to the home page
            return next({ path: '/' })
        } else {
            return next()
        }
    } else {
        /* has no token*/
        if (whiteList.indexOf(to.path) !== -1) {
            // in the free login whitelist, go directly
            return next()
        } else {
            // other pages that do not have permission to access are redirected to the login page.
            next(`/login?redirect=${to.path}`)
        }
    }

})
