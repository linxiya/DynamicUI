#!/bin/bash
###
 # @Author: zhengyilin 1596307621@qq.com
 # @Date: 2025-04-12 14:14:33
 # @LastEditors: zhengyilin 1596307621@qq.com
 # @LastEditTime: 2025-04-23 17:35:56
 # @FilePath: /jafan/FSL/devops/corgi.sh
 # @Description: Do not edit
 # 1596307621
 # Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
### 

project_name="chunli"
module="chunli-frontend"
current_env=$1
articleServerIP="saas.fantechs.com.cn"
corgi_root_path="/corgi/$project_name/$project_name-frontend-$current_env"

rm -rf devops/article && mkdir -p devops/article
echo "module: $1, current_env: $1"


echo " ※ 压缩article文件夹"
cp -r dist devops/article/dist
tar -zcvf devops/article.tar.gz -C devops article
mv devops/article.tar.gz devops/article/article.tar.gz

echo " ※ 备份服务器ocean文件夹"
timestamp=$(date +"%Y-%m-%d_%H:%M:%S")
ssh root@$articleServerIP "mkdir -p $corgi_root_path && mkdir -p /corgi/$project_name/backup/$timestamp && mv $corgi_root_path '/corgi/$project_name/backup/$timestamp' && mkdir -p $corgi_root_path"

echo " ※ 上传article文件夹"
scp devops/article/article.tar.gz  root@$articleServerIP:$corgi_root_path


echo " ※ 编辑更新命令 "
update_content="{\"projectType\":\"ocean-ui\", \"module\":\"${module}\", \"deployEnv\":\"${current_env}\"}"
echo "${update_content}"

echo " ※ 写入更新命令 "
# echo 'ssh root@${articleServerIP} "echo ${update_content} > /corgi/qide/update.txt"'
ssh root@$articleServerIP "echo '${update_content}' > $corgi_root_path/info.txt"


