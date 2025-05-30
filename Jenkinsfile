pipeline {
    agent any

    environment {
        PYTHON_VERSION = '3.9'
        VENV_NAME = 'venv'
        BASE_URL = 'http://localhost:3000'
    }

    stages {
        stage('Setup') {
            steps {
                bat '''
                    python -m venv %%VENV_NAME%%
                    call %%VENV_NAME%%\\Scripts\\activate
                    pip install -r requirements.txt
                '''
            }
        }

        stage('Lint') {
            steps {
                bat '''
                    call %%VENV_NAME%%\\Scripts\\activate
                    flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
                    black . --check
                '''
            }
        }

        stage('Test') {
            steps {
                bat '''
                    call %%VENV_NAME%%\\Scripts\\activate
                    pytest -v --cov=. --cov-report=html --cov-report=xml --html=test_report.html
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

        stage('Build') {
            steps {
                bat '''
                    npm install
                    npm run build
                '''
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                bat '''
                    echo Deploying to production...
                    REM Add your deployment commands here
                '''
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
} 
