import pytest
import requests
from dotenv import load_dotenv
import os
import time

# Load environment variables
load_dotenv()

# Base URL for the application
BASE_URL = os.getenv('BASE_URL', 'http://localhost:3000')

@pytest.fixture(scope="session")
def base_url():
    """Fixture to provide base URL for tests"""
    return BASE_URL

@pytest.fixture(scope="session")
def test_credentials():
    """Fixture to provide test credentials"""
    return {
        "email": os.getenv('TEST_EMAIL', 'test@example.com'),
        "password": os.getenv('TEST_PASSWORD', 'testpassword123')
    }

def test_login_page_loads(base_url):
    """Test that the login page loads successfully"""
    response = requests.get(f"{base_url}/login")
    assert response.status_code == 200
    assert "Secure Password Manager" in response.text
    assert "Sign in" in response.text

def test_invalid_login(base_url):
    """Test login with invalid credentials"""
    data = {
        "email": "invalid@example.com",
        "password": "wrongpassword"
    }
    response = requests.post(f"{base_url}/api/login", json=data)
    assert response.status_code in [401, 400]  # Either unauthorized or bad request
    assert "error" in response.json()

def test_password_reset_request(base_url):
    """Test password reset request endpoint"""
    data = {
        "email": "test@example.com"
    }
    response = requests.post(f"{base_url}/api/reset-password", json=data)
    assert response.status_code in [200, 400]  # Either success or bad request
    if response.status_code == 200:
        assert "success" in response.json()

def test_google_auth_endpoint(base_url):
    """Test that Google auth endpoint is available"""
    response = requests.get(f"{base_url}/api/auth/google")
    assert response.status_code in [200, 302]  # Either success or redirect

def test_register_page_loads(base_url):
    """Test that the registration page loads successfully"""
    response = requests.get(f"{base_url}/register")
    assert response.status_code == 200
    assert "Create your Vault" in response.text
    assert "Sign up" in response.text

def test_invalid_registration(base_url):
    """Test registration with invalid data"""
    data = {
        "email": "invalid-email",
        "password": "short"
    }
    response = requests.post(f"{base_url}/api/register", json=data)
    assert response.status_code == 400
    assert "error" in response.json()

def test_2fa_flow(base_url, test_credentials):
    """Test 2FA flow if enabled"""
    # First login attempt
    login_response = requests.post(f"{base_url}/api/login", json=test_credentials)
    if login_response.status_code == 200 and "2fa_required" in login_response.json():
        # If 2FA is required, test the verification
        two_factor_data = {
            "token": "123456"  # This should be a valid test token
        }
        verify_response = requests.post(f"{base_url}/api/verify-2fa", json=two_factor_data)
        assert verify_response.status_code in [200, 401]

def test_session_management(base_url, test_credentials):
    """Test session management and logout"""
    # Login first
    login_response = requests.post(f"{base_url}/api/login", json=test_credentials)
    if login_response.status_code == 200:
        session_token = login_response.json().get("token")
        headers = {"Authorization": f"Bearer {session_token}"}
        
        # Test protected route
        protected_response = requests.get(f"{base_url}/api/protected", headers=headers)
        assert protected_response.status_code == 200
        
        # Test logout
        logout_response = requests.post(f"{base_url}/api/logout", headers=headers)
        assert logout_response.status_code == 200
        
        # Verify session is invalidated
        invalid_response = requests.get(f"{base_url}/api/protected", headers=headers)
        assert invalid_response.status_code == 401

if __name__ == "__main__":
    pytest.main(["-v", "--html=test_report.html"]) 