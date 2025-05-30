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
                sh '''
                    python -m venv ${VENV_NAME}
                    . ${VENV_NAME}/bin/activate
                    pip install -r requirements.txt
                '''
            }
        }

        stage('Lint') {
            steps {
                sh '''
                    . ${VENV_NAME}/bin/activate
                    flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
                    black . --check
                '''
            }
        }

        stage('Test') {
            steps {
                sh '''
                    . ${VENV_NAME}/bin/activate
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
                sh '''
                    . ${VENV_NAME}/bin/activate
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
                sh '''
                    echo "Deploying to production..."
                    # Add your deployment commands here
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