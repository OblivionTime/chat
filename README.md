
# <center>翎<center>

# 🎥项目演示地址
<<<<<<< HEAD

🔗[https://www.bilibili.com/video/BV1am4y1B7bo/?spm_id_from=333.999.0.0](https://www.bilibili.com/video/BV1am4y1B7bo/?spm_id_from=333.999.0.0)
=======
🔗[https://www.bilibili.com/video/BV1Fg4y1u76d/](https://www.bilibili.com/video/BV1Fg4y1u76d/)
>>>>>>> 897d04c69b73801c5fa65c33e1a0c45cb3b5de7d
**希望观众老爷给个免费的三连支持一下新人up主**

# ♻️项目基本介绍

`翎`是基于`electron(vue2)`和`nodejs`实现的简单聊天软件,其中用`websocket`和`http`进行通讯传递,数据库使用了`mysql`数据库,该项目功能简单,界面简洁,适合正在练习`websocket`和`vue`的小白查看代码,代码量极少且逻辑清晰,每个功能都会添加相应的逻辑供大家观看学习(大佬勿喷)
<<<<<<< HEAD

=======
# 🧨项目目前存在的问题
* 如果在同一台电脑上,进行视频通话,是不成功的,因为会出现摄像头也被占用问题,但是语音通话是可以的
* 目前逻辑是必须双方都在同时相互聊天,才能进行语音和视频通话
* 目前用户可以同时和不同的人同时进行音视频(后期会修改这个逻辑)
* 目前视频通话存在画质模糊问题(待修复)
# 👻注意事项
1. 打开软件第一时间修改服务器地址

![在这里插入图片描述](https://img-blog.csdnimg.cn/163aa1f40fc14711915900ff7df25ce0.png)


![在这里插入图片描述](https://img-blog.csdnimg.cn/cfe2887d3aa9463eae637335871f8abf.png)


格式必须为`https://你的ip地址`,技术人员根据自己的需求去修改
>>>>>>> 897d04c69b73801c5fa65c33e1a0c45cb3b5de7d
# 🎉已完成功能

* 登录账号
* 修改服务器地址
* 注册账号
* 忘记密码
* 查询好友和群聊
* 添加好友和群聊
* 一对一聊天
* 发送表情包,图片,文字,文件(50mb以内)
* 支持一对一语音通话,一对一视频通话
* 集成`new bing`
# 🎗️待完成功能

* 搜索好友和群聊
* 群聊
* 修改好友备注
* 好友通过请求
* 删除好友
* 群视频
* 共享屏幕
# 🤖如何在项目使用new bing
## 你必须要满足以下条件
1. 科学上网
2. edge登录了bing以及能使用new bing
## 优点
1.保存每次会话记录
2. 获取一次聊天次数后,就可以无需科学上网永久使用对话(每六小时自动重置次数)
## 基本使用
1. 设置代理服务器
![在这里插入图片描述](https://img-blog.csdnimg.cn/4f82e09f138c4cee9ed657d66e13b423.png)

2. 生成次数
![在这里插入图片描述](https://img-blog.csdnimg.cn/95c35de9a4ca4749814a565a7079143c.png)

3. 开始对话
![在这里插入图片描述](https://img-blog.csdnimg.cn/8f17e6d1249742abad19073d0102f0ce.png)

# 🪵前端框架和技术介绍

前端主要是由`vue2`和`electron`配合`elementui`UI框架实现的页面

## vue2

Vue.js是一款流行的前端JavaScript框架，它由尤雨溪(Yuxi You)开发并维护，第一个版本发布于2014年2月。Vue.js 的目标是通过尽可能简单的 API 实现响应式的数据绑定和组合视图组件。

Vue.js的核心库只关注视图层，易于上手，同时也可以轻松与其他第三方库或现有项目集成。Vue.js 可以通过简单的模板语法和可重用组件来实现快速开发，它也支持许多高级特性，例如计算属性、指令、路由、状态管理等。

Vue.js在2016年发布了Vue.js 2.0版本，Vue.js 2.x的性能得到了很大提升，并增加了许多新特性。Vue.js 2.x使用虚拟DOM（Virtual DOM）进行高效的DOM更新，还支持服务端渲染（SSR）和单文件组件（SFC）等功能。Vue.js 2.x也提供了更好的TypeScript支持，使得开发更加友好。

Vue.js还有一些周边生态，例如Vue Router、Vuex、Vue CLI、Vue Devtools等，这些库可以进一步扩展Vue.js的功能和性能，以提高开发效率。

##  electron

Electron（前身为Atom Shell）是由 GitHub 开发的一款跨平台桌面应用程序开发框架，它基于 Chromium 和 Node.js 构建，允许开发者使用 web 技术（如 HTML、CSS 和 JavaScript）构建原生的跨平台桌面应用程序。Electron 的目标是让开发人员使用简单的前端技术构建跨平台桌面应用程序，并且可以像开发网页一样进行调试。

Electron 采用了多进程架构，应用程序主进程使用 Node.js 运行，用于管理应用程序的生命周期和处理系统级别的操作，如菜单、对话框、剪贴板等。而渲染进程则是一个 Chromium 浏览器实例，用于渲染应用程序的 UI。

Electron 提供了丰富的 API 和开发工具，例如可以通过 Electron-Builder、Electron-Packager 等工具将应用程序打包成可执行文件，并支持跨平台发布和自动更新。此外，Electron 还支持许多第三方模块和插件，如 Spectron、electron-devtools-installer、electron-store 等，用于进一步扩展应用程序的功能。

Electron 已经被广泛应用于许多知名的跨平台应用程序，如 Visual Studio Code、GitHub Desktop、Slack、Atom、Discord 等。

## elementui

Element UI 是一款基于 Vue.js 2.0 的桌面端组件库，由饿了么前端团队开发并维护。它提供了丰富的 UI 组件，包括表单、表格、弹窗、菜单、导航等，可以满足大部分企业级应用的 UI 需求。

Element UI 设计风格简洁、美观，同时还具备响应式设计，可以适应不同屏幕尺寸的设备。Element UI 的组件可高度定制，允许通过修改主题、样式、属性等实现自定义的外观和功能。

Element UI 还提供了丰富的文档和示例，便于开发人员快速学习和上手，同时也提供了丰富的 API 文档和源代码，方便开发者进行二次开发和定制。

除了 Vue.js，Element UI 还支持其他常用的前端框架，例如 React、Angular 等，可以与这些框架轻松集成。Element UI 是一款开源的组件库，采用 MIT 许可证，可以在任何商业和非商业项目中免费使用。

## 目录介绍

![在这里插入图片描述](https://img-blog.csdnimg.cn/04de8008d2d047088cd064440a6b7022.png)

### 核心文件介绍

#### components的vueImageVerify.vue

这个文件主要是生成验证码图片

#### utils的cookie.js

这个文件主要是帮你存储你的登录信息,个人信息到缓存里

#### utils的file.js

这个文件主要是获取从一个url里获取文件名和判断你的文件类型是图片还是zip或者其他的

#### utils的request.js

这个文件主要就是向后端发送请求并获取相应的数据,axios

#### views的Login

这个目录核心就是负责`登录`,`注册`,`忘记密码`,`修改服务器地址`,代码基本上一样,如果看懂其中一个页面其他页面的代码基本上就都看懂了,以下是实现登录的核心逻辑,简单吧!!

![在这里插入图片描述](https://img-blog.csdnimg.cn/7d8fc561b5124895aa517d1d3df70c84.png)

#### views的index目录

这个目录偏核心一点,主要就是我们登录后的界面,界面主要分为三大块,`侧边栏`,`列表栏`,`聊天栏`,侧边只会影响`列表栏`并不会影响`聊天栏`

## 前端逻辑

1. 用户打开应用后,页面具有四个功能,`登录`,`注册`,`找回密码`,`设置服务器地址`,二个次要功能`自动登录`和`记住密码`,填入正确的用户名和密码后会直接跳转到首页,如果填入失败则会提示响应的错误

![在这里插入图片描述](https://img-blog.csdnimg.cn/e2ba818ab25548a5b1f35b4668b48e3b.png)

2. 登录成功或者注册成功后,我们将进入到主页面,主页面主要由`侧边栏`,`列表栏`,`聊天栏`组成,`侧边栏`主要可以进行`个人信息的修改`,选择`聊天`和`联系人`,当我们点击其中一个图片,我们会进行相对于的`tag`修改,然后通过vue的路由跳转实现响应的界面展示

![在这里插入图片描述](https://img-blog.csdnimg.cn/6fe3ebac59e04c408ec86d7ac9763478.png)

3. 当我们选择一个好友时,我们获取房间号和好友名称来建立一个`websocket`,后端会发送所有与之相关的所有历史记录,前端会根据消息的类型来进行相对应的展示,(音视频记录不会展示,可以做但是不想做😼😼😼),当发送或接收一条消息会自动更新`列表栏`的数据

![在这里插入图片描述](https://img-blog.csdnimg.cn/616e8cd7b58e437a8a1eff4781d88074.png)

# 后端项目

后端主要是由`nodejs`配合`express`和`express-ws`实现简单的后端搭建,通过`mysql`对数据的存储,代码已经实现创建各个表,无需执行`sql`文件,代码简单且逻辑基本上类似,懂一些即可懂大部分,适合新手

## nodejs

Node.js是一个基于Chrome V8引擎的JavaScript运行时环境，使JavaScript可以在服务器端运行。Node.js采用事件驱动、非阻塞I/O模型，因此可以处理大量并发连接，且处理速度快、性能高。Node.js的模块化设计使得开发者可以方便地组织代码和管理依赖项。

Node.js最初由Ryan Dahl在2009年开发，目的是构建高性能、可扩展的网络应用程序。Node.js的优点在于可以使用JavaScript编写服务器端代码，并且可以方便地与前端JavaScript框架进行集成，如React、Angular、Vue.js等。

Node.js拥有丰富的内置库和第三方模块，可用于构建Web应用程序、命令行工具、网络服务器、流处理应用程序等。Node.js提供了许多有用的工具和工具库，如npm、Express、Socket.IO等，使得开发和维护应用程序变得更加轻松和高效。

Node.js具有跨平台的特性，可在Windows、Linux、macOS等不同操作系统上运行。由于其强大的性能和便捷的开发体验，Node.js被越来越多的开发者和企业所采用，并且在大型公司和开源社区中得到了广泛的应用。

## express

Express是一个流行的基于Node.js的Web应用程序框架，提供了一组简单的API，可以帮助开发者更快地构建Web应用程序。Express采用MVC（模型-视图-控制器）的软件设计模式，使得开发者可以将应用程序的逻辑、数据和UI分离开来，从而使得代码更加模块化和易于维护。

Express框架提供了许多有用的功能和中间件，如路由、模板引擎、HTTP工具、数据库集成等，可帮助开发者快速构建Web应用程序。同时，Express也是高度可定制的，允许开发者根据需求自定义中间件和插件，以满足特定的开发需求。

Express非常流行，因为它具有简单、轻量级、易于学习的特点，同时也可以通过第三方模块扩展其功能，例如body-parser、cookie-parser、multer等。Express也被广泛应用于许多开源项目和企业级应用程序中，包括GitHub、PayPal、IBM等。

## express-ws

Express-ws是一个基于Express框架的WebSocket插件，用于在Express应用程序中添加WebSocket功能。WebSocket是一种网络协议，允许客户端和服务器之间进行双向通信，可以在Web应用程序中实现实时数据传输和通信。

Express-ws提供了WebSocket相关的API，可帮助开发者快速添加WebSocket功能，同时也与Express的中间件机制兼容，使得WebSocket和HTTP请求可以在同一应用程序中共存。使用Express-ws，开发者可以在Express应用程序中实现实时通信、在线游戏、聊天室等功能。

Express-ws支持标准的WebSocket协议和Socket.IO协议，可以通过简单的API进行配置和使用。Express-ws也可以与其他Express中间件和插件集成，例如Express-session、Passport等，以实现更加复杂的功能。

总的来说，Express-ws是一个非常有用的工具，使得在Express应用程序中添加WebSocket功能变得更加容易和快速，可以大大提高Web应用程序的实时通信能力。

## 目录介绍

![在这里插入图片描述](https://img-blog.csdnimg.cn/11c581bf6e5241cf81a227ece54279e7.png)

### 后端逻辑

我会将后端所有逻辑都写在代码里,可以根据自己需求去查看相对应的代码块

# 🎙️WebRTC

## 代码逻辑

1. 邀请人先创建麦克风并初始化PC源

2. 发送创建房间的指令到当前房间,后端接受到指令后,给当前房间的所有用户发送响应的指令

![在这里插入图片描述](https://img-blog.csdnimg.cn/e803127e3d8645a3b468c44a825b4269.png)

3. 被邀请人点击同意后,获取自己的视频流,初始化PC源,PC添加音视频流,创建offer,获取自己的音视频流,并通过setLocalDescription函数存储自己的音视频流,并发送peer指令(携带自己的音视频)告诉邀请人要存储自己的音视频

![在这里插入图片描述](https://img-blog.csdnimg.cn/7f039caed012453dac2c14e2ce4e3bd0.png)
![在这里插入图片描述](https://img-blog.csdnimg.cn/dbe2de1f9dc2409b87ed65ecb9af3fa9.png)

4. 邀请人接受到对方同意的指令后,将对方的音视频流通过setRemoteDescription函数进行存储,存储完后邀请人创建answer来获取自己的音视频流,通过setLocalDescription函数存储自己的音视频流,并发送answer指令(携带自己的音视频)告诉对方要存储邀请人的音视频

![在这里插入图片描述](https://img-blog.csdnimg.cn/0bd551ca94b6420dbbe28266c19210fa.png)

5. 设置邀请方发来的音频源

![在这里插入图片描述](https://img-blog.csdnimg.cn/d102c00236cf4555ab33bae24daee803.png)

6.双方建连成功后,会相互发送`ice_candidate`,我们需要将其发送给双方


![在这里插入图片描述](https://img-blog.csdnimg.cn/07782c51b3394ccf809adfb8e824b87a.png)

7.双方收到后,`addIceCandidate`添加到pc中


![在这里插入图片描述](https://img-blog.csdnimg.cn/cecf95d2ce3d43febb5d18a3a7acb0d0.png)

8. 如何验证成功了,一般是查看`pc.onaddstream`是否监听到数据,如果有大概率就是ok的

![在这里插入图片描述](https://img-blog.csdnimg.cn/fd55c12db2654ebe8fb3f1f93955f20a.png)

# 🕹️数据库

目前这些表只是待定的,后期大概率还是会改里面的字段

## 用户表(user)

![在这里插入图片描述](https://img-blog.csdnimg.cn/c687f7a37c1143afb6193595013ac445.png)
这是一个MySQL数据库中的用户表，其中包含以下字段：

* id：用户ID，用于标识每个用户，是自动增加的整数类型。
* username：用户名，必填字段，用于登录和身份验证，是一个长度为255的字符串，使用utf8mb4编码和Unicode排序规则，使用B树索引来保证唯一性。
* password：用户密码，必填字段，用于登录验证，是一个长度为255的字符串，使用utf8mb4编码和Unicode排序规则，不需要索引。
* avatar：用户头像，可选字段，用于显示用户的个人信息，是一个长度为255的字符串，使用utf8mb4编码和Unicode排序规则，可以为NULL。
* phone：用户电话，可选字段，用于联系用户，是一个长度为50的字符串，使用utf8mb4编码和Unicode排序规则，可以为NULL。
* name：用户昵称，可选字段，用于显示用户的个人信息，是一个长度为255的字符串，使用utf8mb4编码和Unicode排序规则，可以为NULL。
* signature：用户签名，可选字段，用于显示用户的个人信息，是一个长文本类型，使用utf8mb4编码和Unicode排序规则，可以为NULL。
* created_at：用户创建时间，用于记录用户的创建时间，是一个日期时间类型，使用当前时间戳作为默认值，可以为NULL。

## 好友表(friend)

![在这里插入图片描述](https://img-blog.csdnimg.cn/d628a04b61b541be89237602f92be4bc.png)

* id: 该字段为自增主键，表示每个朋友记录的唯一标识符。
* user_id: 该字段表示朋友所属的用户 ID。
* username: 该字段表示朋友的用户名。
* avatar: 该字段表示朋友的头像图片链接地址，可以为 NULL。
* online_status: 该字段表示朋友的在线状态，取值为 online 或 offline。
* remark: 该字段表示朋友的备注，可以为 NULL。
* group_id: 该字段表示朋友所属的朋友分组 ID，可以为 NULL。
* room: 该字段表示朋友所在的聊天室，可以为 NULL。
* unread_msg_count: 该字段表示未读消息数量，初始值为 0。
* created_at: 该字段表示记录创建时间，类型为 timestamp。
* updated_at: 该字段表示记录最后一次更新时间，类型为 timestamp，并且设置了 ON UPDATE 触发器以自动更新时间。
* PRIMARY KEY: 指定主键为 id 字段。
* INDEX: 指定索引为 group_id 字段。
* CONSTRAINT: 指定外键约束，将 group_id 字段与 friend_group 表中的 id 字段关联，实现级联更新和级联删除。该约束名称为 friend_ibfk_1。

## 好友组表(friend_group)

![在这里插入图片描述](https://img-blog.csdnimg.cn/9a88e10fd81a4c88b1cffb2d862f8bb7.png)

* id: 主键，自动递增的整数。
* user_id: 外键，引用user表的id字段，整数类型。
* username: 用户名，最大长度为255个字符，使用utf8mb4字符集和utf8mb4_unicode_ci排序规则。
* name: 组名，最大长度为50个字符，使用utf8mb4字符集和utf8mb4_unicode_ci排序规则。
* created_at: 记录创建时间，时间戳类型，默认值为当前时间戳。
* updated_at: 记录更新时间，时间戳类型，默认值为当前时间戳，在记录更新时自动更新。
* 此外，该表还定义了一个名为idx_user_id的索引，用于加速对user_id字段的查询。并且定义了一个名为friend_group_ibfk_1的外键约束，当删除user表中的记录时，会级联删除与之关联的friend_group表中的记录。

## 群聊表(group_chat)

![在这里插入图片描述](https://img-blog.csdnimg.cn/4142e495759b4fb4b19097b70eab4089.png)

* id: 主键，自动递增的整数。
* name: 群聊名称，最大长度为50个字符，使用utf8mb4字符集和utf8mb4_unicode_ci排序规则。
* creator_id: 外键，引用user表的id字段，整数类型。
* avatar: 群聊头像，最大长度为255个字符，使用utf8mb4字符集和utf8mb4_unicode_ci排序规则。
* announcement: 群公告，文本类型，使用utf8mb4字符集和utf8mb4_unicode_ci排序规则。
* room: 房间号，最大长度为255个字符，使用utf8mb4字符集和utf8mb4_unicode_ci排序规则。
* created_at: 记录创建时间，时间戳类型，默认值为当前时间戳。
* updated_at: 记录更新时间，时间戳类型，默认值为当前时间戳，在记录更新时自动更新。
* 此外，该表还定义了一个名为idx_creator_id的索引，用于加速对creator_id字段的查询。并且定义了一个名为group_chat_ibfk_1的外键约束，当删除user表中的记录时，会级联删除与之关联的group_chat表中的记录。

## 群聊成员表(group_numbers)

![在这里插入图片描述](https://img-blog.csdnimg.cn/dc5c2de67c594fd7922652b9571f906a.png)

* id: 主键，自动递增的整数。
* group_id: 外键，引用group_chat表的id字段，整数类型。
* user_id: 用户ID，整数类型。
* nickname: 用户在群聊中的昵称，最大长度为50个字符，使用utf8mb4字符集和utf8mb4_unicode_ci排序规则。
* created_at: 记录创建时间，时间戳类型，默认值为当前时间戳。
* updated_at: 记录更新时间，时间戳类型，默认值为当前时间戳，在记录更新时自动更新。
* 此外，该表还定义了两个索引：一个名为idx_user_id的索引用于加速对user_id字段的查询；另一个名为idx_group_id的索引用于加速对group_id字段的查询。并且定义了一个名为group_members_ibfk_1的外键约束，当删除group_chat表中的记录时，会级联删除与之关联的group_members表中的记录

## 消息表(message)

![在这里插入图片描述](https://img-blog.csdnimg.cn/613e40a3635a47d4931bda67b6e2f8b6.png)

* id: 主键，自动递增的整数。
* sender_id: 外键，引用user表的id字段，整数类型。
* receiver_id: 接收者ID，整数类型。
* content: 消息内容，长文本类型，使用utf8mb4字符集和utf8mb4_unicode_ci排序规则。
* room: 房间号，最大长度为255个字符，使用utf8mb4字符集和utf8mb4_unicode_ci排序规则。
* type: 消息类型，枚举类型，可选值为’private’和’group’。
* media_type: 媒体类型，枚举类型，可选值为’text’、‘image’、‘video’和’file’。
* status: 消息状态，整数类型，默认值为0。
* created_at: 记录创建时间，时间戳类型，默认值为当前时间戳。
  此外，该表还定义了一个名为sender_id的索引，用于加速对sender_id字段的查询。并且定义了一个名为message_ibfk_1的外键约束，当删除user表中的记录时，会级联删除与之关联的message表中的记录。

## 消息统计表(message_statistics)

![在这里插入图片描述](https://img-blog.csdnimg.cn/2372a088b20340ceb655364e4c1a4ddb.png)

* id: 主键，自动递增的整数。
* room: 房间号，最大长度为255个字符，使用utf8mb4字符集和utf8mb4_unicode_ci排序规则。
* total: 消息总数，整数类型。
* created_at: 记录创建时间，时间戳类型，默认值为当前时间戳。
* updated_at: 记录更新时间，时间戳类型，默认值为当前时间戳，在记录更新时自动更新。
  该表没有定义外键约束和索引。

# 🔖项目运行

## 后端运行

```shell
git clone https://github.com/OblivionTime/chat.git
cd server
yarn
node index.js
```

## 前端调试运行

```shell
git clone https://github.com/OblivionTime/chat.git
cd ui
yarn
#调试
yarn server
#打包
yarn build
```

## 注意electron打包会出现的问题

## 打包前必须做的事

- 进入到下面目录C:\Users\自己的用户名\AppData\Local\electron-builder\Cache
  ![在这里插入图片描述](https://img-blog.csdnimg.cn/07e7a371077042039fe75a7aae4ada23.png)



- 创建目录**winCodeSign**和**nsis**
  ![在这里插入图片描述](https://img-blog.csdnimg.cn/99b0ca3b41fb424498775ad81274c950.png)



- 将**electron必须安装包**目录下的**winCodeSign-2.6.0.7z**解压到**C:\Users\自己的用户名\AppData\Local\electron-builder\Cache\winCodeSign**目录下

![在这里插入图片描述](https://img-blog.csdnimg.cn/fb7781236a1b4fa8a8b42f2c19c80346.png)


- 进入到**C:\Users\自己的用户名\AppData\Local\electron-builder\Cache\nsis**目录下,将**electron必须安装包**目录下分别解压成如下图所示的样子
  ![在这里插入图片描述](https://img-blog.csdnimg.cn/6d91296313c9490a9de1b58c0db6373e.png)
  详细教程:[https://www.cnblogs.com/liliyou/p/13423709.html](https://www.cnblogs.com/liliyou/p/13423709.html)