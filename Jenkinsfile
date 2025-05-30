pipeline {
    agent any

    environment {
        PYTHON_VERSION = '3.13'
        VENV_NAME = 'venv'
        BASE_URL = 'http://localhost:3000'
        WORKSPACE = pwd()
    }

    stages {
        stage('Setup') {
            steps {
                bat '''
                    echo Current directory: %CD%
                    echo Workspace: %WORKSPACE%
                    echo Python version:
                    python --version
                    echo Creating virtual environment in: %%VENV_NAME%%
                    
                    if exist %%VENV_NAME%% (
                        echo Removing existing virtual environment...
                        rmdir /s /q %%VENV_NAME%%
                    )
                    
                    echo Creating new virtual environment...
                    python -m venv %%VENV_NAME%%
                    if errorlevel 1 (
                        echo Failed to create virtual environment
                        exit /b 1
                    )
                    
                    echo Verifying virtual environment structure...
                    if not exist %%VENV_NAME%% (
                        echo Virtual environment directory not created
                        exit /b 1
                    )
                    
                    if not exist %%VENV_NAME%%\\Scripts (
                        echo Scripts directory not found in virtual environment
                        exit /b 1
                    )
                    
                    if not exist %%VENV_NAME%%\\Scripts\\activate.bat (
                        echo activate.bat not found in Scripts directory
                        exit /b 1
                    )
                    
                    echo Activating virtual environment...
                    call %%VENV_NAME%%\\Scripts\\activate.bat
                    if errorlevel 1 (
                        echo Failed to activate virtual environment
                        exit /b 1
                    )
                    
                    echo Verifying Python path after activation...
                    where python
                    
                    echo Installing dependencies...
                    python -m pip install --upgrade pip
                    python -m pip install --no-cache-dir -r requirements.txt
                    if errorlevel 1 (
                        echo Failed to install dependencies
                        exit /b 1
                    )
                    
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
                    python -m flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
                    python -m black . --check
                '''
            }
        }

        stage('Test') {
            steps {
                bat '''
                    echo Current directory: %CD%
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
                    python -m pytest -v --cov=. --cov-report=html --cov-report=xml --html=test_report.html
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
