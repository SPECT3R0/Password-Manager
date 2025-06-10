pipeline {
    agent any

    environment {
        PROJECT_DIR = "E:/SSDD Project/project"
    }

    stages {
        stage('Build & Deploy') {
            steps {
                withCredentials([string(credentialsId: 'FIREBASE_CI_TOKEN', variable: 'FIREBASE_TOKEN')]) {
                    bat '''
                        cd /d "%PROJECT_DIR%"
                        call npm install
                        call npm run build
                        echo Deploying to Firebase...
                        call firebase deploy --only hosting --token %FIREBASE_TOKEN%
                    '''
                }
            }
        }
    }

    post {
        always {
            echo "✅ Pipeline completed (Build & Deploy phase)"
        }
    }
}
