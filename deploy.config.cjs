/*
 * @Author: zhengyilin 1596307621@qq.com
 * @Date: 2025-04-12 11:32:48
 * @LastEditors: zhengyilin 1596307621@qq.com
 * @LastEditTime: 2025-09-25 16:29:28
 * @FilePath: /web3.1/deploy.config.cjs
 * @Description: Do not edit
 * 1596307621
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */
module.exports = {
    projectName: 'rfid',
    passphrase: '',
    cluster: [],
    test: {
        name: '测试环境',
        script: 'npm run build:test',
        host: '',
        port: 22,
        username: 'root',
        password: 'fantech1.0',
        distPath: 'dist',
        webDir: '/home/ocean-ui/dist',
        bakDir: '',
        isRemoveRemoteFile: true,
        isRemoveLocalFile: false
    },
    dev: {
        name: '开发环境127',
        script: 'npm run build:dev',
        host: '192.168.204.127',
        port: 22,
        username: 'root',
        password: 'fantech1.0@127',
        distPath: 'dist',
        webDir: '/home/ocean-ui/dist',
        bakDir: '',
        isRemoveRemoteFile: true,
        isRemoveLocalFile: false
    },
    prod: {
        name: '生产环境', // 环境名称
        script: 'npm run build', // 打包命令
        host: '192.168.204.153', // 服务器地址
        port: 22, // 服务器端口号
        username: 'root', // 服务器登录用户名
        password: '123456xxxxx', // 服务器登录密码, 这里故意写错的，为了打包压缩后终止，不上传
        distPath: 'dist', // 本地打包生成目录
        webDir: '/usr/local/nginx/html', // 服务器部署路径（不可为空或'/'）
        bakDir: '', // 备份路径 (打包前备份之前部署目录 最终备份路径为 /usr/local/nginx/backup/html.zip)
        isRemoveRemoteFile: true, // 是否删除远程文件（默认true）
        isRemoveLocalFile: false // 是否删除本地文件（默认true）
    }
}