// Test the actual API response parsing
async function testApiResponse() {
  try {
    console.log('1. Fetching from API...');
    const response = await fetch('http://localhost:3000/api/users');
    
    console.log('2. Response status:', response.status);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    console.log('3. Parsing JSON...');
    const data = await response.json();
    
    console.log('4. Raw data structure:');
    console.log('   - typeof data:', typeof data);
    console.log('   - Array.isArray(data):', Array.isArray(data));
    console.log('   - data keys:', Object.keys(data));
    
    if (data.data) {
      console.log('5. data.data exists:');
      console.log('   - typeof data.data:', typeof data.data);
      console.log('   - data.data keys:', Object.keys(data.data));
      
      if (data.data.users) {
        console.log('6. data.data.users exists:');
        console.log('   - Array.isArray(data.data.users):', Array.isArray(data.data.users));
        console.log('   - data.data.users.length:', data.data.users.length);
        
        if (data.data.users.length > 0) {
          console.log('7. First user:', data.data.users[0]);
        }
      }
    }
    
    // Test the extraction logic
    console.log('\\n8. Testing extraction logic:');
    let extractedUsers;
    
    if (Array.isArray(data)) {
      extractedUsers = data;
      console.log('   -> Used direct array');
    } else if (data.data && data.data.users !== undefined) {
      extractedUsers = data.data.users;
      console.log('   -> Used data.data.users');
    } else if (data.data !== undefined) {
      extractedUsers = data.data;
      console.log('   -> Used data.data');
    } else if (data.users !== undefined) {
      extractedUsers = data.users;
      console.log('   -> Used data.users');
    } else {
      extractedUsers = data;
      console.log('   -> Used data directly');
    }
    
    console.log('\\n9. Final result:');
    console.log('   - Array.isArray(extractedUsers):', Array.isArray(extractedUsers));
    console.log('   - extractedUsers.length:', extractedUsers.length);
    console.log('   - Can call .map():', typeof extractedUsers.map === 'function');
    
    if (extractedUsers.length > 0) {
      console.log('\\n10. Testing .map() function:');
      const emails = extractedUsers.map(user => user.email);
      console.log('    - emails:', emails);
      console.log('    - SUCCESS: .map() worked!');
    }
    
  } catch (error) {
    console.error('ERROR:', error.message);
  }
}

testApiResponse();
