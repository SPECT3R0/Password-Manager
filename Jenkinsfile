pipeline {
    agent any

    environment {
        PYTHON_VERSION = '3.13'
        VENV_PATH = 'venv'
        SRC_PATH = 'src'
        BASE_URL = 'http://localhost:5173'
    }

    stages {
        stage('Setup') {
            steps {
                bat '''
                    echo Current directory: %CD%
                    echo Python version:
                    python --version
                    echo Creating virtual environment in: %VENV_PATH%
                    
                    if exist %VENV_PATH% (
                        echo Removing existing virtual environment...
                        rmdir /s /q %VENV_PATH%
                    )
                    
                    echo Creating new virtual environment...
                    python -m venv %VENV_PATH% || exit /b 1
                    
                    echo Verifying virtual environment structure...
                    if not exist %VENV_PATH% (
                        echo Virtual environment directory not created
                        exit /b 1
                    )
                    
                    if not exist %VENV_PATH%\\Scripts (
                        echo Scripts directory not found in virtual environment
                        exit /b 1
                    )
                    
                    if not exist %VENV_PATH%\\Scripts\\activate.bat (
                        echo activate.bat not found in Scripts directory
                        exit /b 1
                    )
                    
                    echo Activating virtual environment...
                    call %VENV_PATH%\\Scripts\\activate.bat || exit /b 1
                    
                    echo Verifying Python path after activation...
                    where python
                    
                    echo Installing dependencies...
                    python -m pip install --upgrade pip || exit /b 1
                    python -m pip install --no-cache-dir -r requirements.txt || exit /b 1
                    
                    echo Verifying installed packages...
                    pip list
                '''
            }
        }

        stage('Lint') {
            steps {
                bat '''
                    echo Current directory: %CD%
                    echo Activating virtual environment for linting...
                    if not exist %VENV_PATH%\\Scripts\\activate.bat (
                        echo Virtual environment activation script not found
                        exit /b 1
                    )
                    
                    call %VENV_PATH%\\Scripts\\activate.bat || exit /b 1
                    
                    echo Running linting checks...
                    echo Running flake8 on %SRC_PATH%...
                    python -m flake8 %SRC_PATH% || exit /b 1
                    
                    echo Running black check...
                    python -m black --check %SRC_PATH% || exit /b 1
                '''
            }
        }

        stage('Test') {
            steps {
                bat '''
                    echo Current directory: %CD%
                    echo Activating virtual environment for testing...
                    if not exist %VENV_PATH%\\Scripts\\activate.bat (
                        echo Virtual environment activation script not found
                        exit /b 1
                    )
                    
                    call %VENV_PATH%\\Scripts\\activate.bat || exit /b 1
                    
                    echo Running tests...
                    python -m pytest -v --cov=%SRC_PATH% --cov-report=html --cov-report=xml --html=test_report.html || exit /b 1
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
                    echo Current directory: %CD%
                    echo Installing Node.js dependencies...
                    npm install || exit /b 1
                    
                    echo Building application...
                    npm run build || exit /b 1
                '''
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                bat '''
                    echo Current directory: %CD%
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
