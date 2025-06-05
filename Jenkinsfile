pipeline {
    agent any

    environment {
        PYTHON_VERSION = '3.13'
        VENV_PATH = 'venv'
        SRC_PATH = 'src'
        BASE_URL = 'http://localhost:5173'
        ZAP_PATH = 'E:\\Zed Attack Proxy\\zap.bat'
    }

    stages {
        stage('Setup') {
            steps {
                bat '''
                    echo Installing Python dependencies...
                    if exist %VENV_PATH% rmdir /s /q %VENV_PATH%
                    python -m venv %VENV_PATH% || exit /b 1
                    call %VENV_PATH%\Scripts\activate.bat || exit /b 1
                    python -m pip install --upgrade pip
                    pip install -r requirements.txt || exit /b 1
                '''
            }
        }

        stage('Lint') {
            steps {
                bat '''
                    call %VENV_PATH%\Scripts\activate.bat || exit /b 1
                    python -m flake8 %SRC_PATH% || exit /b 1
                    python -m black --check %SRC_PATH% || exit /b 1
                '''
            }
        }

        stage('Start Dev Server') {
            steps {
                bat '''
                    echo Starting development server for tests and DAST...
                    start /B npm run dev
                    timeout /t 20 /nobreak
                '''
            }
        }

        stage('Test') {
            steps {
                bat '''
                    call %VENV_PATH%\Scripts\activate.bat || exit /b 1
                    python -m pytest -v --cov=%SRC_PATH% --cov-report=html:htmlcov --cov-report=xml --html=test_report.html || exit /b 1
                '''
            }
            post {
                always {
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'htmlcov',
                        reportFiles: 'index.html',
                        reportName: 'Coverage Report'
                    ])
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: '.',
                        reportFiles: 'test_report.html',
                        reportName: 'Test Report'
                    ])
                }
            }
        }

        stage('SAST - Snyk') {
            steps {
                bat '''
                    echo Running Snyk SAST scan...
                    snyk test --all-projects --json > snyk-results.json || exit /b 1
                    node -e "const data = require('./snyk-results.json'); const critical = (data.vulnerabilities || []).filter(v => v.severity === 'critical').length; const high = (data.vulnerabilities || []).filter(v => v.severity === 'high').length; if (critical > 0 || high > 0) { console.error(`\n❌ Found ${critical} critical and ${high} high vulnerabilities`); process.exit(1); } console.log('✅ No critical or high severity issues found.');"
                '''
            }
        }

        stage('DAST - OWASP ZAP') {
            steps {
                bat '''
                    echo Running OWASP ZAP DAST scan...
                    if exist "%ZAP_PATH%" (
                        "%ZAP_PATH%" quick-scan --self-contained --start-options "-config api.disablekey=true" --spider %BASE_URL% --scan || exit /b 1
                    ) else (
                        echo ZAP CLI not found at %ZAP_PATH%
                        exit /b 1
                    )
                '''
            }
        }

        stage('Build') {
            steps {
                bat '''
                    echo Installing frontend dependencies and building app...
                    npm install || exit /b 1
                    npm run build || exit /b 1
                '''
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                withCredentials([string(credentialsId: 'FIREBASE_CI_TOKEN', variable: 'FB_TOKEN')]) {
                    bat '''
                        echo Deploying to Firebase hosting...
                        call firebase deploy --token %FB_TOKEN% --only hosting || exit /b 1
                    '''
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
