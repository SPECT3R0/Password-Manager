pipeline {
    agent any

    environment {
        PROJECT_DIR = "E:\\SSDD Project\\project"
        ZAP_PATH = "E:\\Zed Attack Proxy\\zap.bat"
        BASE_URL = "http://localhost:5173"  // Update if your app uses a different URL
    }

    stages {
        stage('Initialize Workspace') {
            steps {
                bat """
                    if not exist "${PROJECT_DIR}\\results" (
                        mkdir "${PROJECT_DIR}\\results"
                        echo "✅ Created results directory at ${PROJECT_DIR}\\results"
                    )
                    dir "${PROJECT_DIR}\\results"
                """
            }
        }

        stage('SAST - Snyk Scan') {
            steps {
                script {
                    def timestamp = new Date().format('yyyyMMdd_HHmmss')
                    def jsonReport = "${PROJECT_DIR}\\results\\snyk_sast_${timestamp}.json"
                    def htmlReport = "${PROJECT_DIR}\\results\\snyk_report_${timestamp}.html"

                    bat """
                        echo "🔍 Running Snyk SAST scan..."
                        cd /d "${PROJECT_DIR}"
                        snyk test --all-projects --json > "${jsonReport}"
                        snyk-to-html -i "${jsonReport}" -o "${htmlReport}"
                        echo "📄 Reports generated:"
                        echo "  - ${jsonReport}"
                        echo "  - ${htmlReport}"
                    """

                    // Fail build on critical/high vulnerabilities
                    def snykResults = readJSON file: jsonReport
                    def critical = snykResults.vulnerabilities.count { it.severity == 'critical' }
                    def high = snykResults.vulnerabilities.count { it.severity == 'high' }
                    
                    if (critical > 0 || high > 0) {
                        error("❌ Found ${critical} critical and ${high} high vulnerabilities")
                    }
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: "results/snyk_*${timestamp}.*"
                }
            }
        }

        stage('DAST - OWASP ZAP') {
            steps {
                script {
                    def timestamp = new Date().format('yyyyMMdd_HHmmss')
                    def zapReport = "${PROJECT_DIR}\\results\\zap_dast_${timestamp}.json"

                    bat """
                        echo "🛡️ Starting ZAP DAST scan..."
                        if exist "${ZAP_PATH}" (
                            cd /d "${PROJECT_DIR}"
                            "${ZAP_PATH}" quick-scan --self-contained \\
                                --start-options "-config api.disablekey=true" \\
                                --spider "${BASE_URL}" \\
                                --scan \\
                                -r "${zapReport}" || (
                                echo "⚠️ ZAP completed with findings"
                            )
                        ) else (
                            echo "❌ ZAP not found at ${ZAP_PATH}"
                            exit 1
                        )
                        echo "📄 DAST report saved to ${zapReport}"
                    """
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: "results/zap_dast_*.json"
                }
            }
        }

        stage('Dependency Check') {
            steps {
                script {
                    def timestamp = new Date().format('yyyyMMdd_HHmmss')
                    def depCheckReport = "${PROJECT_DIR}\\results\\depcheck_${timestamp}.json"

                    bat """
                        echo "🧩 Running Dependency-Check..."
                        cd /d "${PROJECT_DIR}"
                        dependency-check.bat --scan . --format JSON --out "${depCheckReport}"
                        echo "📄 Dependency report saved to ${depCheckReport}"
                    """
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: "results/depcheck_*.json"
                }
            }
        }
    }

    post {
        always {
            script {
                // Summarize all reports
                echo "📂 Scan Results Summary:"
                bat """
                    dir "${PROJECT_DIR}\\results"
                """

                // Generate combined HTML report (optional)
                bat """
                    cd /d "${PROJECT_DIR}"
                    type results\\snyk_sast_*.json results\\zap_dast_*.json results\\depcheck_*.json > results\\combined_report_${currentBuild.number}.log
                """
            }
        }
        success {
            echo "✅ All security scans completed successfully!"
            slackSend color: 'good', message: "Security scans passed for ${env.JOB_NAME} #${env.BUILD_NUMBER}"
        }
        failure {
            echo "❌ Pipeline failed due to security vulnerabilities"
            slackSend color: 'danger', message: "Security scans failed for ${env.JOB_NAME} #${env.BUILD_NUMBER}"
            emailext (
                subject: "🚨 ${env.JOB_NAME} - Vulnerabilities Detected",
                body: """Check the reports at ${env.BUILD_URL}
                        Vulnerabilities require immediate attention!""",
                attachmentsPattern: 'results/*.json, results/*.html'
            )
        }
    }
}
