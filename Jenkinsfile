pipeline {
    agent any

    environment {
        // Path configurations
        PROJECT_DIR = "E:\\SSDD Project\\project"
        ZAP_PATH = "E:\\Zed Attack Proxy\\zap.bat"
        BASE_URL = "http://localhost:5173"
        SNYK_CMD = "C:\\Users\\Junaid\\AppData\\Roaming\\npm\\snyk.cmd"
        SNYK_HTML_CMD = "C:\\Users\\Junaid\\AppData\\Roaming\\npm\\snyk-to-html.cmd"
        
        // Customizable thresholds (for logging only)
        CRITICAL_SEVERITY = "critical"
        HIGH_SEVERITY = "high"
    }

    stages {
        stage('Initialize') {
            steps {
                script {
                    // Create results directory with timestamp
                    def scanTimestamp = new Date().format('yyyyMMdd_HHmmss')
                    env.RESULTS_DIR = "${PROJECT_DIR}\\results\\scan_${scanTimestamp}"
                    
                    bat """
                        mkdir "${RESULTS_DIR}"
                        echo "📁 Results will be saved to: ${RESULTS_DIR}"
                    """
                }
            }
        }

        stage('SAST - Snyk Scan') {
            steps {
                script {
                    try {
                        def jsonReport = "${RESULTS_DIR}\\snyk_sast.json"
                        def htmlReport = "${RESULTS_DIR}\\snyk_report.html"
                        def logFile = "${RESULTS_DIR}\\snyk_scan.log"

                        bat """
                            echo "🔍 Starting Snyk SAST Scan (results won't fail pipeline)..."
                            cd /d "${PROJECT_DIR}"
                            call "${SNYK_CMD}" test --all-projects --json > "${jsonReport}" 2>&1 | tee "${logFile}"
                            call "${SNYK_HTML_CMD}" -i "${jsonReport}" -o "${htmlReport}"
                            
                            echo "=== Vulnerability Summary ===" >> "${logFile}"
                            type "${jsonReport}" | jq -r '.vulnerabilities[] | \"\(.severity | ascii_upcase): \(.packageName)@\(.version) - \(.title)\"' >> "${logFile}"
                        """

                        // Parse and log findings without failing
                        def snykResults = readJSON file: jsonReport
                        def vulns = snykResults.vulnerabilities ?: []
                        
                        echo "📊 Snyk Found ${vulns.size()} Vulnerabilities:"
                        vulns.each { vuln ->
                            echo "  ${vuln.severity.toUpperCase()}: ${vuln.packageName}@${vuln.version} - ${vuln.title}"
                        }
                        
                    } catch (Exception e) {
                        echo "⚠️ Snyk Scan Failed (continuing anyway): ${e.message}"
                    }
                }
            }
        }

        stage('DAST - OWASP ZAP') {
            steps {
                script {
                    try {
                        def zapReport = "${RESULTS_DIR}\\zap_dast.json"
                        def zapLog = "${RESULTS_DIR}\\zap_scan.log"

                        bat """
                            echo "🛡️ Starting ZAP DAST Scan..."
                            if exist "${ZAP_PATH}" (
                                cd /d "${PROJECT_DIR}"
                                "${ZAP_PATH}" quick-scan --self-contained \\
                                    --start-options "-config api.disablekey=true" \\
                                    --spider "${BASE_URL}" \\
                                    --scan \\
                                    -r "${zapReport}" 2>&1 | tee "${zapLog}"
                            ) else (
                                echo "❌ ZAP not found at ${ZAP_PATH}" >> "${zapLog}"
                            )
                        """
                        
                        // Log ZAP findings
                        if (fileExists(zapReport)) {
                            def zapResults = readJSON file: zapReport
                            echo "📊 ZAP Found ${zapResults.site?.size() ?: 0} Vulnerabilities"
                        }
                        
                    } catch (Exception e) {
                        echo "⚠️ ZAP Scan Failed (continuing anyway): ${e.message}"
                    }
                }
            }
        }

        stage('Dependency Check') {
            steps {
                script {
                    try {
                        def depCheckReport = "${RESULTS_DIR}\\dependency_check.json"
                        def depCheckLog = "${RESULTS_DIR}\\dependency_check.log"

                        bat """
                            echo "🧩 Running Dependency-Check..."
                            cd /d "${PROJECT_DIR}"
                            dependency-check.bat --scan . --format JSON --out "${depCheckReport}" 2>&1 | tee "${depCheckLog}"
                        """
                        
                    } catch (Exception e) {
                        echo "⚠️ Dependency-Check Failed (continuing anyway): ${e.message}"
                    }
                }
            }
        }

        stage('Build & Deploy') {
            steps {
                script {
                    echo "🚀 Proceeding with build and deployment despite any findings..."
                    bat """
                        cd /d "${PROJECT_DIR}"
                        npm install
                        npm run build
                        
                        echo "Deploying to Firebase..."
                        firebase deploy --only hosting
                    """
                }
            }
        }
    }

    post {
        always {
            script {
                // Archive all results
                archiveArtifacts artifacts: "results/scan_*/**", allowEmptyArchive: true
                
                // Generate consolidated report
                def summaryFile = "${RESULTS_DIR}\\security_summary.txt"
                bat """
                    echo "🔒 SECURITY SCAN SUMMARY" > "${summaryFile}"
                    echo "=======================" >> "${summaryFile}"
                    
                    echo "🛠️ Tools Used:" >> "${summaryFile}"
                    echo "  - Snyk SAST" >> "${summaryFile}"
                    echo "  - OWASP ZAP DAST" >> "${summaryFile}"
                    echo "  - OWASP Dependency-Check" >> "${summaryFile}"
                    
                    echo "" >> "${summaryFile}"
                    echo "📅 Scan Timestamp: ${new Date().format('yyyy-MM-dd HH:mm:ss')}" >> "${summaryFile}"
                    
                    echo "" >> "${summaryFile}"
                    type "${RESULTS_DIR}\\snyk_scan.log" | findstr /C:"CRITICAL:" /C:"HIGH:" >> "${summaryFile}" || echo "No Snyk findings" >> "${summaryFile}"
                    
                    echo "" >> "${summaryFile}"
                    echo "📁 Full reports available at:" >> "${summaryFile}"
                    dir "${RESULTS_DIR}" /b >> "${summaryFile}"
                """
                
                // Print summary to console
                echo "=== Security Scan Summary ==="
                bat "type \"${summaryFile}\""
                
                // Optional: Send notifications
                emailext (
                    subject: "🔍 Security Scan Completed for ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                    body: readFile(summaryFile),
                    attachmentsPattern: "${RESULTS_DIR}\\**"
                )
            }
        }
    }
}
