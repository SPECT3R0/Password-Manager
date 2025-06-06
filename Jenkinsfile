pipeline {
    agent any

    environment {
        PROJECT_DIR = "E:/SSDD Project/project"
        ZAP_PATH = "E:/Zed Attack Proxy/zap.bat"
        BASE_URL = "http://localhost:5173"
        SNYK_CMD = "C:/Users/Junaid/AppData/Roaming/npm/snyk.cmd"
        SNYK_HTML_CMD = "C:/Users/Junaid/AppData/Roaming/npm/snyk-to-html.cmd"
        DEP_CHECK_PATH = "E:/Dependency checker/bin/dependency-check.bat"
    }

    stages {
        stage('Initialize') {
            steps {
                script {
                    def scanTimestamp = new Date().format('yyyyMMdd_HHmmss')
                    env.RESULTS_DIR = "${PROJECT_DIR}/results/scan_${scanTimestamp}"
                    bat """
                        mkdir "${env.RESULTS_DIR}"
                        echo Results will be saved to: ${env.RESULTS_DIR}
                    """
                }
            }
        }

        stage('SAST - Snyk Scan') {
            steps {
                script {
                    try {
                        def jsonReport = "${env.RESULTS_DIR}/snyk_sast.json"
                        def htmlReport = "${env.RESULTS_DIR}/snyk_report.html"

                        bat """
                            echo Starting Snyk SAST Scan (non-blocking)...
                            cd /d "${env.PROJECT_DIR}"
                            call "${env.SNYK_CMD}" test --all-projects --json > "${jsonReport}"
                            call "${env.SNYK_HTML_CMD}" -i "${jsonReport}" -o "${htmlReport}"
                        """

                        if (fileExists(jsonReport)) {
                            def snykResults = readJSON file: jsonReport
                            def vulns = snykResults.vulnerabilities ?: []
                            echo "📊 Snyk Found ${vulns.size()} Vulnerabilities:"
                            vulns.each { vuln ->
                                echo "  ${vuln.severity.toUpperCase()}: ${vuln.packageName}@${vuln.version} - ${vuln.title}"
                            }
                        }

                    } catch (Exception e) {
                        echo "⚠️ Snyk Scan Failed: ${e.message}"
                    }
                }
            }
        }

        stage('DAST - OWASP ZAP') {
            steps {
                script {
                    try {
                        def zapReport = "${env.RESULTS_DIR}/zap_dast.json"

                        bat """
                            echo Starting ZAP DAST Scan...
                            cd /d "E:/Zed Attack Proxy"
                            zap.bat quick-scan --self-contained --start-options "-config api.disablekey=true" --spider "${env.BASE_URL}" --scan -r "${zapReport}"
                        """

                        if (fileExists(zapReport)) {
                            def zapResults = readJSON file: zapReport
                            echo "📊 ZAP Found ${zapResults.site?.size() ?: 0} Vulnerabilities"
                        }

                    } catch (Exception e) {
                        echo "⚠️ ZAP Scan Failed: ${e.message}"
                    }
                }
            }
        }

        stage('Dependency Check') {
            steps {
                script {
                    try {
                        def depCheckReport = "${env.RESULTS_DIR}/dependency_check.json"

                        bat """
                            echo Running Dependency-Check...
                            cd /d "${env.PROJECT_DIR}"
                            call "${env.DEP_CHECK_PATH}" --scan . --format JSON --out "${depCheckReport}"
                        """
                    } catch (Exception e) {
                        echo "⚠️ Dependency-Check Failed: ${e.message}"
                    }
                }
            }
        }

        stage('Build & Deploy') {
            steps {
                script {
                    echo "🚀 Proceeding with build and deployment..."
                    bat """
                        cd /d "${env.PROJECT_DIR}"
                        npm install
                        npm run build
                        echo Deploying to Firebase...
                        firebase deploy --only hosting
                    """
                }
            }
        }
    }

    post {
        always {
            script {
                archiveArtifacts artifacts: "results/scan_*/**", allowEmptyArchive: true
                def summaryFile = "${env.RESULTS_DIR}/security_summary.txt"

                bat """
                    echo SECURITY SCAN SUMMARY > "${summaryFile}"
                    echo ======================= >> "${summaryFile}"
                    echo Tools Used: >> "${summaryFile}"
                    echo   - Snyk SAST >> "${summaryFile}"
                    echo   - OWASP ZAP DAST >> "${summaryFile}"
                    echo   - OWASP Dependency-Check >> "${summaryFile}"
                    echo. >> "${summaryFile}"
                    echo Scan Timestamp: ${new Date().format('yyyy-MM-dd HH:mm:ss')} >> "${summaryFile}"
                    echo. >> "${summaryFile}"
                    echo Full reports: >> "${summaryFile}"
                    dir "${env.RESULTS_DIR}" /b >> "${summaryFile}"
                """

                echo "=== Security Scan Summary ==="
                bat "type \"${summaryFile}\""
            }
        }
    }
}
