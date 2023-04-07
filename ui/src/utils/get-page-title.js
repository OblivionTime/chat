/*
 * @Description: 
 * @Version: 1.0
 * @Autor: solid
 * @Date: 2022-05-17 12:45:40
 * @LastEditors: solid
 * @LastEditTime: 2022-10-28 20:57:38
 */

const title = "element简单版后台管理平台"

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${title} - ${pageTitle} `
  }
  return `${title}`
}
