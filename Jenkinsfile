pipeline {
    agent any

    environment {
        PYTHON_VERSION = '3.9'
        VENV_NAME = 'venv'
        BASE_URL = 'http://localhost:3000'
        WORKSPACE = pwd()
    }

    stages {
        stage('Setup') {
            steps {
                bat '''
                    echo Creating Python virtual environment...
                    if exist %%VENV_NAME%% (
                        echo Virtual environment already exists, removing...
                        rmdir /s /q %%VENV_NAME%%
                    )
                    
                    python -m venv %%VENV_NAME%%
                    if errorlevel 1 (
                        echo Failed to create virtual environment
                        exit /b 1
                    )
                    
                    echo Activating virtual environment...
                    if not exist %%VENV_NAME%%\\Scripts\\activate.bat (
                        echo Virtual environment activation script not found
                        exit /b 1
                    )
                    
                    call %%VENV_NAME%%\\Scripts\\activate.bat
                    if errorlevel 1 (
                        echo Failed to activate virtual environment
                        exit /b 1
                    )
                    
                    echo Installing dependencies...
                    python -m pip install --upgrade pip
                    pip install -r requirements.txt
                    if errorlevel 1 (
                        echo Failed to install dependencies
                        exit /b 1
                    )
                '''
            }
        }

        stage('Lint') {
            steps {
                bat '''
                    echo Activating virtual environment for linting...
                    if not exist %%VENV_NAME%%\\Scripts\\activate.bat (
                        echo Virtual environment activation script not found
                        exit /b 1
                    )
                    
                    call %%VENV_NAME%%\\Scripts\\activate.bat
                    if errorlevel 1 (
                        echo Failed to activate virtual environment
                        exit /b 1
                    )
                    
                    echo Running linting checks...
                    flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
                    black . --check
                '''
            }
        }

        stage('Test') {
            steps {
                bat '''
                    echo Activating virtual environment for testing...
                    if not exist %%VENV_NAME%%\\Scripts\\activate.bat (
                        echo Virtual environment activation script not found
                        exit /b 1
                    )
                    
                    call %%VENV_NAME%%\\Scripts\\activate.bat
                    if errorlevel 1 (
                        echo Failed to activate virtual environment
                        exit /b 1
                    )
                    
                    echo Running tests...
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
                    echo Installing Node.js dependencies...
                    npm install
                    if errorlevel 1 (
                        echo Failed to install Node.js dependencies
                        exit /b 1
                    )
                    
                    echo Building application...
                    npm run build
                    if errorlevel 1 (
                        echo Failed to build application
                        exit /b 1
                    )
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
