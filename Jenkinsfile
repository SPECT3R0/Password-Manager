pipeline {
    agent any

    environment {
        BASE_URL = 'http://localhost:5173'
        ZAP_PATH = 'E:/Zed Attack Proxy/zap.bat'
    }

    stages {
        stage('SAST - Snyk') {
            steps {
                script {
                    try {
                        // Run Snyk scan and save results
                        bat """
                            echo Running Snyk SAST scan...
                            call C:\\Users\\Junaid\\AppData\\Roaming\\npm\\snyk.cmd test --all-projects --json > snyk-results.json
                        """
                        
                        // Process results with detailed output
                        def result = bat(
                            script: """
                                node -e "
                                    const fs = require('fs');
                                    try {
                                        const data = JSON.parse(fs.readFileSync('./snyk-results.json'));
                                        const critical = (data.vulnerabilities || []).filter(v => v.severity === 'critical');
                                        const high = (data.vulnerabilities || []).filter(v => v.severity === 'high');
                                        
                                        // Print summary
                                        console.log('\\n📊 Snyk Scan Results:');
                                        console.log('✅ Low severity: ' + (data.vulnerabilities || []).filter(v => v.severity === 'low').length);
                                        console.log('⚠️ Medium severity: ' + (data.vulnerabilities || []).filter(v => v.severity === 'medium').length);
                                        console.log('❗ High severity: ' + high.length);
                                        console.log('❌ Critical severity: ' + critical.length);
                                        
                                        // Print details of high/critical vulnerabilities
                                        if (critical.length > 0 || high.length > 0) {
                                            console.log('\\n🔍 Found critical/high vulnerabilities:');
                                            
                                            critical.forEach(v => {
                                                console.log('\\n🛑 CRITICAL: ' + v.id);
                                                console.log('   Package: ' + v.packageName + '@' + v.version);
                                                console.log('   Vulnerability: ' + v.title);
                                                console.log('   Info: ' + v.description.substring(0, 100) + '...');
                                                console.log('   Fix: ' + (v.fixedIn || ['No fix available']).join(', '));
                                            });
                                            
                                            high.forEach(v => {
                                                console.log('\\n⚠️ HIGH: ' + v.id);
                                                console.log('   Package: ' + v.packageName + '@' + v.version);
                                                console.log('   Vulnerability: ' + v.title);
                                                console.log('   Info: ' + v.description.substring(0, 100) + '...');
                                                console.log('   Fix: ' + (v.fixedIn || ['No fix available']).join(', '));
                                            });
                                            
                                            process.exit(1);
                                        } else {
                                            console.log('\\n🎉 No critical or high severity vulnerabilities found!');
                                        }
                                    } catch (e) {
                                        console.error('❌ Error processing Snyk results:', e.message);
                                        process.exit(1);
                                    }
                                "
                            """,
                            returnStatus: true
                        )
                        
                        if (result != 0) {
                            error("Snyk scan found critical/high vulnerabilities - check logs for details")
                        }
                    } catch (e) {
                        echo "❌ Snyk scan failed: ${e.getMessage()}"
                        // Archive the results file even if the scan fails
                        archiveArtifacts artifacts: 'snyk-results.json', allowEmptyArchive: true
                        error("SAST check failed due to vulnerabilities")
                    }
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'snyk-results.json', allowEmptyArchive: true
                }
            }
        }

        stage('DAST - OWASP ZAP') {
            steps {
                bat """
                    echo Running OWASP ZAP DAST scan...
                    if exist "%ZAP_PATH%" (
                        "%ZAP_PATH%" quick-scan --self-contained --start-options "-config api.disablekey=true" --spider %BASE_URL% --scan || exit /b 1
                    ) else (
                        echo ZAP not found at %ZAP_PATH%
                        exit /b 1
                    )
                """
            }
        }

        stage('Build') {
            steps {
                bat """
                    echo Installing dependencies and building app...
                    npm install || exit /b 1
                    npm run build || exit /b 1
                """
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                withCredentials([string(credentialsId: 'FIREBASE_CI_TOKEN', variable: 'FB_TOKEN')]) {
                    bat """
                        echo Deploying to Firebase...
                        call firebase deploy --token %FB_TOKEN% --only hosting || exit /b 1
                    """
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo '✅ CI/CD Pipeline completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed due to issues.'
        }
    }
}
