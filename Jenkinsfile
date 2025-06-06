pipeline {
    agent any

    environment {
        BASE_URL = 'http://localhost:5173'
        ZAP_PATH = 'E:\\Zed Attack Proxy\\zap.bat'
    }

    stages {
        stage('SAST - Snyk') {
            steps {
                bat """
                    echo Running Snyk SAST scan...
                    call C:\\Users\\Junaid\\AppData\\Roaming\\npm\\snyk.cmd test --all-projects --json > snyk-results.json || exit /b 1
                    node -e "const data = require('./snyk-results.json'); const critical = (data.vulnerabilities || []).filter(v => v.severity === 'critical').length; const high = (data.vulnerabilities || []).filter(v => v.severity === 'high').length; if (critical > 0 || high > 0) { console.error('❌ Found ' + critical + ' critical and ' + high + ' high vulnerabilities'); process.exit(1); } else { console.log('✅ No critical or high severity issues found.'); }"
                """
            }
        }

        stage('DAST - OWASP ZAP') {
            steps {
                bat """
                    echo Running OWASP ZAP DAST scan...
                    if exist "%ZAP_PATH%" (
                        "%ZAP_PATH%" quick-scan --self-contained --start-options "-config api.disablekey=true" --spider %BASE_URL% --scan || exit /b 1
                    ) else (
                        echo ZAP not found at %ZAP_PATH%
                        exit /b 1
                    )
                """
            }
        }

        stage('Build') {
            steps {
                bat """
                    echo Installing dependencies and building app...
                    npm install || exit /b 1
                    npm run build || exit /b 1
                """
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                withCredentials([string(credentialsId: 'FIREBASE_CI_TOKEN', variable: 'FB_TOKEN')]) {
                    bat """
                        echo Deploying to Firebase...
                        call firebase deploy --token %FB_TOKEN% --only hosting || exit /b 1
                    """
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo '✅ CI/CD Pipeline completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed due to issues.'
        }
    }
}
