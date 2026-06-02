const API_URL = 'http://localhost:8000';

async function runTests() {
    console.log("Starting Phase 1 Testing");
    console.log("==================================================")
    
    const timestamp = Date.now();
    const adminEmail = `commander_${timestamp}@nebula-corp.com`;
    const standardEmail = `testuser_${timestamp}@gmail.com`;
    const password = "SecurePassword123!";

    // Test 1: Health Check
    try {
        const healthRes = await fetch(`${API_URL}/health`);
        const healthData = await healthRes.json();
        console.log(`✅ [TEST 1] Health Check: ${healthData.status}`);
    } catch (error) {
        console.log(`❌ [TEST 1] Health Check Failed. Make sure your server is running on port 8000!`);
        return; // Stop executing if the server is offline
    }

    // Test 2: Admin Provisioning (Signup)
    try {
        const adminRes = await fetch(`${API_URL}/api/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: adminEmail, password })
        });
        const adminData = await adminRes.json();
        
        if (adminData.role === 'Admin') {
            console.log(`✅ [TEST 2] Admin Signup: Successfully assigned Admin role to ${adminEmail}`);
        } else {
            console.log(`❌ [TEST 2] Admin Signup Failed: Role assigned was ${adminData.role}`);
        }
    } catch (error) {
        console.log(`❌ [TEST 2] Admin Signup Failed: ${error.message}`);
    }

    // Test 3: Standard Provisioning (Signup)
    try {
        const stdRes = await fetch(`${API_URL}/api/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: standardEmail, password })
        });
        const stdData = await stdRes.json();
        
        if (stdData.role === 'Standard') {
            console.log(`✅ [TEST 3] Standard Signup: Successfully defaulted to Standard role for ${standardEmail}`);
        } else {
            console.log(`❌ [TEST 3] Standard Signup Failed: Role assigned was ${stdData.role}`);
        }
    } catch (error) {
        console.log(`❌ [TEST 3] Standard Signup Failed: ${error.message}`);
    }

    // Test 4: Login & JWT Validation
    try {
        const loginRes = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: adminEmail, password })
        });
        const loginData = await loginRes.json();
        
        if (loginData.token && loginData.role === 'Admin') {
            console.log(`✅ [TEST 4] Login: Successfully authenticated and received JWT for Admin.`);
        } else {
            console.log(`❌ [TEST 4] Login Failed: Missing token or incorrect role.`);
        }
    } catch (error) {
        console.log(`❌ [TEST 4] Login Failed: ${error.message}`);
    }

    console.log("\n🏁 Phase 1 Testing Complete.");
}

runTests();