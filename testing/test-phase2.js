const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:8000';
// Adjust path to look in the root folder from the testing folder
const MANIFEST_PATH = path.join(__dirname, '../manifest.txt'); 

async function runPhase2Tests() {
    console.log("🚀 Starting Phase 2 Automated Tests...\n");

    // 1. Check if manifest.txt exists
    if (!fs.existsSync(MANIFEST_PATH)) {
        console.log(`❌ [SETUP FAILED] Could not find manifest.txt at ${MANIFEST_PATH}`);
        return;
    }

    const timestamp = Date.now();
    const adminEmail = `commander_${timestamp}@nebula-corp.com`;
    const standardEmail = `testuser_${timestamp}@gmail.com`;
    const password = "SecurePassword123!";

    let adminToken, stdToken;

    // 2. Setup: Provision Users & Get Tokens
    try {
        await fetch(`${API_URL}/api/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: adminEmail, password })
        });
        const adminLoginRes = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: adminEmail, password })
        });
        adminToken = (await adminLoginRes.json()).token;

        await fetch(`${API_URL}/api/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: standardEmail, password })
        });
        const stdLoginRes = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: standardEmail, password })
        });
        stdToken = (await stdLoginRes.json()).token;

        console.log("✅ [SETUP] Test users provisioned and tokens acquired.");
    } catch (error) {
        console.log("❌ [SETUP FAILED] Ensure your backend is running on port 8000.");
        return;
    }

    // Prepare Multipart Form Data for Node Fetch
    const fileBuffer = fs.readFileSync(MANIFEST_PATH);
    const fileBlob = new Blob([fileBuffer]);
    
    // 3. Test 1: Standard User Upload Rejection (RBAC)
    try {
        const stdForm = new FormData();
        stdForm.append('manifest', fileBlob, 'manifest.txt');

        const stdUploadRes = await fetch(`${API_URL}/api/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${stdToken}` },
            body: stdForm
        });
        const stdUploadData = await stdUploadRes.json();

        if (stdUploadRes.status === 403 && stdUploadData.message === "Clearance level inadequate.") {
            console.log("✅ [TEST 1] Standard User Rejection: Successfully blocked with 403 error.");
        } else {
            console.log(`❌ [TEST 1] Standard User Rejection Failed. Status: ${stdUploadRes.status}, Message: ${stdUploadData.message}`);
        }
    } catch (error) {
        console.log(`❌ [TEST 1] Request Failed: ${error.message}`);
    }

    // 4. Test 2: Admin User Upload Success
    try {
        const adminForm = new FormData();
        adminForm.append('manifest', fileBlob, 'manifest.txt');

        const adminUploadRes = await fetch(`${API_URL}/api/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${adminToken}` },
            body: adminForm
        });
        
        if (adminUploadRes.status === 200) {
            console.log("✅ [TEST 2] Admin User Upload: Successfully processed manifest.");
        } else {
            console.log(`❌ [TEST 2] Admin Upload Failed. Status: ${adminUploadRes.status}`);
        }
    } catch (error) {
        console.log(`❌ [TEST 2] Request Failed: ${error.message}`);
    }

    // 5. Test 3: Math and Prime Logic Verification
    try {
        const cargoRes = await fetch(`${API_URL}/api/cargo`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const cargoList = await cargoRes.json();

        // Find test cases in the database response
        const lunarOutpost = cargoList.find(c => c.destination === 'Lunar Outpost Delta');
        const sector7Mining = cargoList.find(c => c.destination === 'Sector-7 Mining Rig');
        const sector7Command = cargoList.find(c => c.destination === 'Sector-7 Command Center');

        let logicPassed = true;

        // Check Prime Rejection
        if (lunarOutpost) {
            console.log("❌ [TEST 3] Prime Logic Failed: Lunar Outpost Delta (Weight 17) was saved but should have been rejected.");
            logicPassed = false;
        }
        if (sector7Mining) {
            console.log("❌ [TEST 3] Prime + Math Logic Failed: Sector-7 Mining Rig (20 * 1.45 = 29) was saved but should have been rejected.");
            logicPassed = false;
        }

        // Check Math Multiplication & Non-Prime Save
        if (!sector7Command) {
            console.log("❌ [TEST 3] Save Logic Failed: Sector-7 Command Center is missing from the database.");
            logicPassed = false;
        } else if (sector7Command.weight !== 145) {
            console.log(`❌ [TEST 3] Math Logic Failed: Sector-7 Command Center weight is ${sector7Command.weight}, expected 145.`);
            logicPassed = false;
        }

        if (logicPassed) {
            console.log("✅ [TEST 3] Database Verification: Math conversion and Prime Number rejection working perfectly.");
        }
    } catch (error) {
        console.log(`❌ [TEST 3] Validation Failed: ${error.message}`);
    }

    console.log("\n🏁 Phase 2 Testing Complete.");
}

runPhase2Tests();