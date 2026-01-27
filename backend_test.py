import requests
import sys
import json
from datetime import datetime

class CoDesignAPITester:
    def __init__(self, base_url="https://ideabridge-2.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.project_id = None
        self.session_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json() if response.content else {}
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                self.failed_tests.append({
                    'name': name,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'response': response.text[:200]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                'name': name,
                'error': str(e)
            })
            return False, {}

    def test_health_check(self):
        """Test health endpoint"""
        return self.run_test("Health Check", "GET", "health", 200)

    def test_register_facilitator(self):
        """Test user registration as facilitator"""
        timestamp = datetime.now().strftime('%H%M%S')
        user_data = {
            "email": f"facilitator_{timestamp}@test.com",
            "password": "TestPass123!",
            "name": f"Test Facilitator {timestamp}",
            "role": "facilitator"
        }
        
        success, response = self.run_test(
            "Register Facilitator",
            "POST",
            "auth/register",
            200,
            data=user_data
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user']['id']
            print(f"   Token obtained: {self.token[:20]}...")
            return True
        return False

    def test_register_codesigner(self):
        """Test user registration as co-designer"""
        timestamp = datetime.now().strftime('%H%M%S')
        user_data = {
            "email": f"codesigner_{timestamp}@test.com",
            "password": "TestPass123!",
            "name": f"Test Co-Designer {timestamp}",
            "role": "co-designer"
        }
        
        success, response = self.run_test(
            "Register Co-Designer",
            "POST",
            "auth/register",
            200,
            data=user_data
        )
        return success

    def test_login(self):
        """Test login with registered user"""
        timestamp = datetime.now().strftime('%H%M%S')
        # First register a user
        user_data = {
            "email": f"login_test_{timestamp}@test.com",
            "password": "TestPass123!",
            "name": f"Login Test {timestamp}",
            "role": "facilitator"
        }
        
        # Register
        reg_success, reg_response = self.run_test(
            "Register for Login Test",
            "POST",
            "auth/register",
            200,
            data=user_data
        )
        
        if not reg_success:
            return False
            
        # Now test login
        login_data = {
            "email": user_data["email"],
            "password": user_data["password"]
        }
        
        success, response = self.run_test(
            "Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        return success

    def test_get_me(self):
        """Test getting current user info"""
        if not self.token:
            print("❌ No token available for /auth/me test")
            return False
            
        return self.run_test("Get Current User", "GET", "auth/me", 200)[0]

    def test_create_project(self):
        """Test creating a project"""
        if not self.token:
            print("❌ No token available for project creation")
            return False
            
        project_data = {
            "name": f"Test Project {datetime.now().strftime('%H%M%S')}",
            "description": "A test project for co-design"
        }
        
        success, response = self.run_test(
            "Create Project",
            "POST",
            "projects",
            200,
            data=project_data
        )
        
        if success and 'id' in response:
            self.project_id = response['id']
            print(f"   Project ID: {self.project_id}")
            return True
        return False

    def test_get_projects(self):
        """Test getting user's projects"""
        if not self.token:
            print("❌ No token available for get projects")
            return False
            
        return self.run_test("Get Projects", "GET", "projects", 200)[0]

    def test_create_session(self):
        """Test creating a session"""
        if not self.token or not self.project_id:
            print("❌ No token or project_id available for session creation")
            return False
            
        session_data = {
            "project_id": self.project_id,
            "name": f"Test Session {datetime.now().strftime('%H%M%S')}",
            "description": "A test session"
        }
        
        success, response = self.run_test(
            "Create Session",
            "POST",
            "sessions",
            200,
            data=session_data
        )
        
        if success and 'id' in response:
            self.session_id = response['id']
            print(f"   Session ID: {self.session_id}")
            return True
        return False

    def test_get_sessions(self):
        """Test getting sessions"""
        if not self.token:
            print("❌ No token available for get sessions")
            return False
            
        return self.run_test("Get Sessions", "GET", "sessions", 200)[0]

    def test_design_tools(self):
        """Test all design tool endpoints"""
        if not self.token or not self.session_id:
            print("❌ No token or session_id available for design tools")
            return False
            
        tools_passed = 0
        total_tools = 6
        
        # Test Problem Tree
        problem_tree_data = {
            "session_id": self.session_id,
            "core_problem": "Test problem",
            "items": [
                {"id": "1", "text": "Test cause", "type": "cause"},
                {"id": "2", "text": "Test effect", "type": "effect"}
            ]
        }
        
        if self.run_test("Create Problem Tree", "POST", "problem-trees", 200, problem_tree_data)[0]:
            tools_passed += 1
            self.run_test("Get Problem Tree", "GET", f"problem-trees/{self.session_id}", 200)
            self.run_test("Update Problem Tree", "PUT", f"problem-trees/{self.session_id}", 200, problem_tree_data)
        
        # Test Empathy Map
        empathy_data = {
            "session_id": self.session_id,
            "persona_name": "Test User",
            "says": ["Test says"],
            "thinks": ["Test thinks"],
            "does": ["Test does"],
            "feels": ["Test feels"]
        }
        
        if self.run_test("Create Empathy Map", "POST", "empathy-maps", 200, empathy_data)[0]:
            tools_passed += 1
            self.run_test("Get Empathy Map", "GET", f"empathy-maps/{self.session_id}", 200)
            self.run_test("Update Empathy Map", "PUT", f"empathy-maps/{self.session_id}", 200, empathy_data)
        
        # Test Story Map
        story_data = {
            "session_id": self.session_id,
            "title": "Test Journey",
            "items": [
                {"id": "1", "text": "Test activity", "type": "activity", "column": 0, "row": 0}
            ]
        }
        
        if self.run_test("Create Story Map", "POST", "story-maps", 200, story_data)[0]:
            tools_passed += 1
            self.run_test("Get Story Map", "GET", f"story-maps/{self.session_id}", 200)
            self.run_test("Update Story Map", "PUT", f"story-maps/{self.session_id}", 200, story_data)
        
        # Test Ideas Board
        ideas_data = {
            "session_id": self.session_id,
            "ideas": [
                {"id": "1", "text": "Test idea", "category": "general", "votes": 0, "color": "#FFFFFF"}
            ]
        }
        
        if self.run_test("Create Ideas Board", "POST", "ideas-boards", 200, ideas_data)[0]:
            tools_passed += 1
            self.run_test("Get Ideas Board", "GET", f"ideas-boards/{self.session_id}", 200)
            self.run_test("Update Ideas Board", "PUT", f"ideas-boards/{self.session_id}", 200, ideas_data)
        
        # Test Feedback
        feedback_data = {
            "session_id": self.session_id,
            "items": [
                {"id": "1", "text": "Test like", "type": "like"},
                {"id": "2", "text": "Test wish", "type": "wish"},
                {"id": "3", "text": "Test what if", "type": "whatif"}
            ]
        }
        
        if self.run_test("Create Feedback", "POST", "feedback", 200, feedback_data)[0]:
            tools_passed += 1
            self.run_test("Get Feedback", "GET", f"feedback/{self.session_id}", 200)
            self.run_test("Update Feedback", "PUT", f"feedback/{self.session_id}", 200, feedback_data)
        
        # Test Expectations
        expectations_data = {
            "session_id": self.session_id,
            "items": [
                {"id": "1", "text": "Test goal", "type": "goal", "priority": 1},
                {"id": "2", "text": "Test constraint", "type": "constraint", "priority": 2},
                {"id": "3", "text": "Test success", "type": "success", "priority": 1}
            ]
        }
        
        if self.run_test("Create Expectations", "POST", "expectations", 200, expectations_data)[0]:
            tools_passed += 1
            self.run_test("Get Expectations", "GET", f"expectations/{self.session_id}", 200)
            self.run_test("Update Expectations", "PUT", f"expectations/{self.session_id}", 200, expectations_data)
        
        print(f"\n📊 Design Tools: {tools_passed}/{total_tools} working")
        return tools_passed == total_tools

def main():
    print("🚀 Starting Co-Design API Tests...")
    tester = CoDesignAPITester()
    
    # Test sequence
    tests = [
        ("Health Check", tester.test_health_check),
        ("Register Facilitator", tester.test_register_facilitator),
        ("Register Co-Designer", tester.test_register_codesigner),
        ("Login", tester.test_login),
        ("Get Current User", tester.test_get_me),
        ("Create Project", tester.test_create_project),
        ("Get Projects", tester.test_get_projects),
        ("Create Session", tester.test_create_session),
        ("Get Sessions", tester.test_get_sessions),
        ("Design Tools", tester.test_design_tools),
    ]
    
    for test_name, test_func in tests:
        print(f"\n{'='*50}")
        print(f"Running: {test_name}")
        print('='*50)
        
        try:
            success = test_func()
            if not success:
                print(f"❌ {test_name} failed - stopping critical path tests")
                if test_name in ["Register Facilitator", "Create Project", "Create Session"]:
                    break
        except Exception as e:
            print(f"❌ {test_name} crashed: {str(e)}")
            if test_name in ["Register Facilitator", "Create Project", "Create Session"]:
                break
    
    # Print final results
    print(f"\n{'='*60}")
    print(f"📊 FINAL RESULTS")
    print('='*60)
    print(f"Tests passed: {tester.tests_passed}/{tester.tests_run}")
    print(f"Success rate: {(tester.tests_passed/tester.tests_run*100):.1f}%" if tester.tests_run > 0 else "No tests run")
    
    if tester.failed_tests:
        print(f"\n❌ Failed Tests ({len(tester.failed_tests)}):")
        for i, failure in enumerate(tester.failed_tests[:5], 1):  # Show first 5 failures
            print(f"{i}. {failure.get('name', 'Unknown')}")
            if 'error' in failure:
                print(f"   Error: {failure['error']}")
            else:
                print(f"   Expected: {failure.get('expected')}, Got: {failure.get('actual')}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())