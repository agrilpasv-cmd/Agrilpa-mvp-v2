
async function main() {
    const testEmail = `api_test_${Date.now()}@example.com`;
    const testPassword = 'Password123!';

    console.log(`Testing API Endpoint with user: ${testEmail}`);

    try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: testEmail,
                password: testPassword,
                fullName: 'API Test User',
                companyName: 'API Test Co',
                phone: '1234567890',
                country: 'Testland',
                userType: 'comprador',
                product1: 'Coffee',
                volumeRange: '100-500'
            }),
        });

        const data = await response.json();

        console.log('Status Code:', response.status);
        console.log('Response Body:', JSON.stringify(data, null, 2));

        if (response.ok) {
            console.log("SUCCESS: API endpoint registered the user.");
        } else {
            console.log("FAILURE: API endpoint returned an error.");
        }
    } catch (err) {
        console.error('Fetch error:', err);
    }
}

main();
