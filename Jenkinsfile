pipeline {
    agent any

    environment {
        PROJECT_DIR = "E:/SSDD Project/project"
    }

    stages {
        stage('Install Dependencies') {
            steps {
                dir("${PROJECT_DIR}") {
                    bat 'npm install'
                }
            }
        }

        stage('SAST - Snyk Scan') {
            steps {
                dir("${PROJECT_DIR}") {
                    snykSecurity(
                        snykInstallation: 'Default',     // Replace with your configured Snyk CLI name
                        snykTokenId: 'snyk-api',         // Jenkins credentials ID for Snyk API token
                        failOnIssues: false,
                        monitorProjectOnBuild: true
                    )
                }
            }
        }

        stage('Build Project') {
            steps {
                dir("${PROJECT_DIR}") {
                    bat 'npm run build'
                }
            }
        }

        stage('DAST - Nuclei Scan') {
            steps {
                bat """
                cd /d E:\\Nuclie
                nuclei.exe -u https://spect3r-spm.web.app -o nuclei_output.txt || echo "Nuclei scan completed with issues"
                move /Y nuclei_output.txt "%WORKSPACE%\\nuclei_output.txt"
                """
            }
        }

        stage('Archive DAST Results') {
            steps {
                archiveArtifacts artifacts: 'nuclei_output.txt', onlyIfSuccessful: false
            }
        }

        stage('Deploy to Firebase') {
            steps {
                withCredentials([string(credentialsId: 'FIREBASE_CI_TOKEN', variable: 'FIREBASE_TOKEN')]) {
                    dir("${PROJECT_DIR}") {
                        bat '''
                        echo Deploying to Firebase...
                        call firebase deploy --only hosting --token %FIREBASE_TOKEN%
                        '''
                    }
                }
            }
        }
    }

    post {
        always {
            echo '✅ Full CI/CD Pipeline Completed: SAST + DAST + Deployment'
        }
    }
}
