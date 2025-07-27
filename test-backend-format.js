// Simulate the backend response format
const mockBackendResponse = {
  data: {
    users: [
      { id: '1', email: 'test@example.com', fullname: 'Test User' }
    ],
    pagination: { page: 1, limit: 50, total: 1, totalPages: 1 }
  }
};

// Test our handleResponse logic
function handleResponse(data) {
  console.log('Testing handleResponse with backend-style data...');
  console.log('Data type:', typeof data);
  console.log('Is array:', Array.isArray(data));
  
  if (Array.isArray(data)) {
    console.log('Returning array directly');
    return data;
  }
  
  if (data && typeof data === 'object') {
    if (data.data && data.data.users !== undefined) {
      console.log('Using data.data.users, type:', typeof data.data.users, 'Is array:', Array.isArray(data.data.users));
      return data.data.users;
    }
    
    if (data.data !== undefined) {
      console.log('Using data.data');
      return data.data;
    }
    
    if (data.users !== undefined) {
      console.log('Using data.users');
      return data.users;
    }
  }
  
  console.log('Using data directly as fallback');
  return data;
}

const result = handleResponse(mockBackendResponse);
console.log('Final result:', result);
console.log('Result is array:', Array.isArray(result));
console.log('Result length:', result.length);
