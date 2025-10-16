
pipeline {
    agent any

    environment {
        nodeHome = tool "node14.14.0"
        PATH = "${nodeHome}/bin:${env.PATH}"
        currentDeployEnv = "${current_env}"
        gitUrl = "http://121.37.11.32:8091/rfid/web3.1.git"

    }

    stages {
        stage('拉取代码') {
            steps {
                echo "branch: ${gitBranch}, url: ${gitUrl}"
                git branch: "${gitBranch}", url: "${gitUrl}", credentialsId: 'gitlab-password'
            }
        }
        stage('构建项目') {
            steps {
                // sh 'ls'
                // sh 'npm install -g cnpm@6.1.1 --registry=https://registry.npmmirror.com'
                // sh 'cnpm install --registry=https://registry.npmmirror.com'
                // sh 'rm -rf dist'
                // sh 'npm run build:${current_env}'
                sh 'ls'
                sh 'npm i --registry=https://registry.npmmirror.com'
                sh 'rm -rf dist'
                sh 'npm run build:${current_env}'
            }
        }

        stage ('部署项目') {
            steps {
                script {
                    if (currentDeployEnv == 'prod' || currentDeployEnv == 'test') {
                        sh "sh devops/corgi.sh ${currentDeployEnv}"
                    } else {
                        sh "sh devops/deploy.sh dev"
                    }
                }
            }
        }

    }
    post {
        failure {
            script {
                qyWechatNotification mentionedId: '', mentionedMobile: '', moreInfo: '构建失败了', onlyFailSendQyWechatNotify: true, webhookUrl: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=45da52d1-0959-46af-96f6-fc6f4d7eb750'
            }
        }
    }
}
