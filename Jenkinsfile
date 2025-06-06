pipeline {
    agent any

    environment {
        PROJECT_ROOT = "E:\\SSDD Project\\project"
        ZAP_PATH = "E:\\Zed Attack Proxy\\zap.bat"
        SNYK_CMD = "C:\\Users\\Junaid\\AppData\\Roaming\\npm\\snyk.cmd"
        BASE_URL = "http://localhost:5173"  // Change to your app's URL
    }

    stages {
        stage('Initialize') {
            steps {
                script {
                    // Create results directory if not exists
                    bat """
                        if not exist "${PROJECT_ROOT}\\results" (
                            mkdir "${PROJECT_ROOT}\\results"
                            echo "✅ Created results directory at ${PROJECT_ROOT}\\results"
                        )
                    """
                }
            }
        }

        stage('SAST - Snyk Scan') {
            steps {
                script {
                    def timestamp = new Date().format('yyyyMMdd_HHmmss')
                    def reportPath = "${PROJECT_ROOT}\\results\\snyk_sast_${timestamp}.json"

                    bat """
                        echo "🔍 Running Snyk SAST scan..."
                        pushd "${PROJECT_ROOT}"
                        ${SNYK_CMD} test --all-projects --json > "${reportPath}"
                        popd
                        echo "📄 SAST results saved to ${reportPath}"
                    """

                    // Parse and display summary
                    def snykResults = readJSON file: reportPath
                    def vulnCount = snykResults.vulnerabilities?.size() ?: 0
                    echo "📊 Found ${vulnCount} vulnerabilities"
                    
                    archiveArtifacts artifacts: "results/snyk_sast_${timestamp}.json"
                }
            }
        }

        stage('DAST - OWASP ZAP Scan') {
            steps {
                script {
                    def timestamp = new Date().format('yyyyMMdd_HHmmss')
                    def reportPath = "${PROJECT_ROOT}\\results\\zap_dast_${timestamp}.json"

                    bat """
                        echo "🛡️ Running ZAP DAST scan..."
                        if exist "${ZAP_PATH}" (
                            "${ZAP_PATH}" quick-scan --self-contained \\
                                --start-options "-config api.disablekey=true" \\
                                --spider "${BASE_URL}" \\
                                --scan \\
                                -r "${reportPath}" || (
                                echo "⚠️ ZAP completed with findings"
                            )
                        ) else (
                            echo "❌ ZAP not found at ${ZAP_PATH}"
                            exit 1
                        )
                        echo "📄 DAST results saved to ${reportPath}"
                    """

                    archiveArtifacts artifacts: "results/zap_dast_${timestamp}.json"
                }
            }
        }

        stage('Dependency Check') {
            steps {
                script {
                    def timestamp = new Date().format('yyyyMMdd_HHmmss')
                    def reportPath = "${PROJECT_ROOT}\\results\\dependency_check_${timestamp}.json"

                    bat """
                        echo "🧩 Running Dependency-Check..."
                        pushd "${PROJECT_ROOT}"
                        dependency-check.bat --scan . --format JSON --out "${reportPath}"
                        popd
                        echo "📄 Dependency results saved to ${reportPath}"
                    """

                    archiveArtifacts artifacts: "results/dependency_check_${timestamp}.json"
                }
            }
        }
    }

    post {
        always {
            script {
                // Generate combined report summary
                bat """
                    echo "📂 All scan results stored at ${PROJECT_ROOT}\\results:"
                    dir "${PROJECT_ROOT}\\results"
                """

                // Optional: Generate HTML reports
                bat """
                    pushd "${PROJECT_ROOT}"
                    npm install -g snyk-to-html
                    snyk-to-html -i results/snyk_sast_*.json -o results/snyk_report.html
                    popd
                """
                archiveArtifacts artifacts: "results/snyk_report.html"
            }
        }
        failure {
            emailext (
                subject: "🚨 ${env.JOB_NAME} - Build #${env.BUILD_NUMBER} Failed",
                body: """Security scan failed for ${env.BUILD_URL}
                        Check the attached reports for vulnerabilities.""",
                attachmentsPattern: 'results/*.json'
            )
        }
    }
}
