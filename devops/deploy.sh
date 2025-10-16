#!/bin/bash

# 项目名称
PROJECT_NAME="ocean-ui"
# 部署时dist的压缩包名称
TAR_FILE_NAME="ocean-ui.tar"

case $1 in
   dev)   targetServerIP=192.168.204.127 ;;
   *);;
esac

# 远程执行命令($1: 远程执行命令)
function remoteExecute() { ssh root@$targetServerIP "$1";}
# 远程拷贝（$1: 本机文件, $2: 目标文件路径）
function remoteCopy() { scp "$1" root@$targetServerIP:"$2"; }


# 重置publish文件夹
rm -rf publish && mkdir -p publish/

# 压缩dist文件，打包当前目录下 dist/dev/下的h5文件夹至h5.tar压缩文件中，使用tar -xvf h5.tar解压后会解压出h5文件夹，h5文件夹中包括dist/dev/h5/*文件
tar -cvf publish/$TAR_FILE_NAME dist


echo "创建/root/devops文件夹"
remoteExecute "rm -rf /root/devops/$PROJECT_NAME && mkdir -p /root/devops/$PROJECT_NAME"

echo "拷贝dist压缩包"
remoteCopy "publish/$TAR_FILE_NAME" "/root/devops/$PROJECT_NAME/$TAR_FILE_NAME"

echo "备份测试环境dist目录"
timestamp=$(date +"%Y-%m-%d %H:%M:%S")
remoteExecute "mv /home/$PROJECT_NAME/dist '/home/${PROJECT_NAME}/dist_${timestamp}' 2>/dev/null"

echo "解压ocean-ui.tar文件至/home/ocean-ui"
remoteExecute "tar -xf /root/devops/$PROJECT_NAME/$TAR_FILE_NAME -C /home/$PROJECT_NAME/"

