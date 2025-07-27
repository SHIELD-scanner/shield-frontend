import { UserService } from '../src/services/userService';

// Mock fetch globally
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('UserService', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('getUsers', () => {
    it('should fetch users without filters', async () => {
      const mockUsers = [
        { id: '1', email: 'user1@example.com', fullname: 'User One', role: 'Developer', namespaces: ['default'], createdAt: '2024-01-01', lastLogin: null },
        { id: '2', email: 'user2@example.com', fullname: 'User Two', role: 'SysAdmin', namespaces: ['production'], createdAt: '2024-01-01', lastLogin: null }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers
      } as Response);

      const result = await UserService.getUsers();

      expect(mockFetch).toHaveBeenCalledWith('/api/users', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      expect(result).toEqual(mockUsers);
    });

    it('should fetch users with role filter', async () => {
      const mockUsers = [
        { id: '1', email: 'user1@example.com', fullname: 'User One', role: 'Developer', namespaces: ['default'], createdAt: '2024-01-01', lastLogin: null }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers
      } as Response);

      const result = await UserService.getUsers({ role: 'Developer' });

      expect(mockFetch).toHaveBeenCalledWith('/api/users?role=Developer', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      expect(result).toEqual(mockUsers);
    });

    it('should fetch users with namespace filter', async () => {
      const mockUsers = [
        { id: '1', email: 'user1@example.com', fullname: 'User One', role: 'Developer', namespaces: ['default'], createdAt: '2024-01-01', lastLogin: null }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers
      } as Response);

      const result = await UserService.getUsers({ namespace: 'default' });

      expect(mockFetch).toHaveBeenCalledWith('/api/users?namespace=default', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      expect(result).toEqual(mockUsers);
    });

    it('should fetch users with both role and namespace filters', async () => {
      const mockUsers = [
        { id: '1', email: 'user1@example.com', fullname: 'User One', role: 'Developer', namespaces: ['default'], createdAt: '2024-01-01', lastLogin: null }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers
      } as Response);

      const result = await UserService.getUsers({ role: 'Developer', namespace: 'default' });

      expect(mockFetch).toHaveBeenCalledWith('/api/users?role=Developer&namespace=default', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      expect(result).toEqual(mockUsers);
    });

    it('should handle fetch errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ message: 'Database error' })
      } as Response);

      await expect(UserService.getUsers()).rejects.toThrow('Database error');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(UserService.getUsers()).rejects.toThrow('Network error');
    });
  });

  describe('getUserById', () => {
    it('should fetch user by ID', async () => {
      const mockUser = { 
        id: '1', 
        email: 'user1@example.com', 
        fullname: 'User One', 
        role: 'Developer' as const, 
        namespaces: ['default'], 
        createdAt: '2024-01-01', 
        lastLogin: null,
        status: 'active' as const
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser
      } as Response);

      const result = await UserService.getUserById('1');

      expect(mockFetch).toHaveBeenCalledWith('/api/users/1', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      expect(result).toEqual(mockUser);
    });

    it('should handle user not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ message: 'User not found' })
      } as Response);

      await expect(UserService.getUserById('999')).rejects.toThrow('User not found');
    });

    it('should handle server errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ message: 'Database error' })
      } as Response);

      await expect(UserService.getUserById('1')).rejects.toThrow('Database error');
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const newUser = { 
        email: 'newuser@example.com', 
        fullname: 'New User', 
        role: 'Developer' as const, 
        namespaces: ['default'] 
      };
      const createdUser = { 
        id: '3', 
        ...newUser, 
        createdAt: '2024-01-01', 
        lastLogin: null,
        status: 'active' as const
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createdUser
      } as Response);

      const result = await UserService.createUser(newUser);

      expect(mockFetch).toHaveBeenCalledWith('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      expect(result).toEqual(createdUser);
    });

    it('should handle creation errors', async () => {
      const newUser = { 
        email: 'newuser@example.com', 
        fullname: 'New User', 
        role: 'Developer' as const, 
        namespaces: ['default'] 
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ message: 'Validation error' })
      } as Response);

      await expect(UserService.createUser(newUser)).rejects.toThrow('Validation error');
    });
  });

  describe('updateUser', () => {
    it('should update an existing user', async () => {
      const updateData = { email: 'updated@example.com', role: 'SysAdmin' as const };
      const updatedUser = { 
        id: '1', 
        fullname: 'User One', 
        email: 'updated@example.com', 
        role: 'SysAdmin' as const, 
        namespaces: ['default'], 
        createdAt: '2024-01-01', 
        lastLogin: null,
        status: 'active' as const
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedUser
      } as Response);

      const result = await UserService.updateUser("1", updateData);

      expect(mockFetch).toHaveBeenCalledWith('/api/users/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      expect(result).toEqual(updatedUser);
    });

    it('should handle update errors', async () => {
      const updateData = { email: 'updated@example.com' };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ message: 'User not found' })
      } as Response);

      await expect(UserService.updateUser("999", updateData)).rejects.toThrow('User not found');
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const deletedUser = { 
        id: '1', 
        email: 'user1@example.com', 
        fullname: 'User One', 
        role: 'Developer' as const, 
        namespaces: ['default'], 
        createdAt: '2024-01-01', 
        lastLogin: null,
        status: 'inactive' as const
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => deletedUser
      } as Response);

      const result = await UserService.deleteUser("1");

      expect(mockFetch).toHaveBeenCalledWith('/api/users/1', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      expect(result).toEqual(deletedUser);
    });

    it('should handle delete errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ message: 'User not found' })
      } as Response);

      await expect(UserService.deleteUser("999")).rejects.toThrow('User not found');
    });
  });

  describe('activateUser', () => {
    it('should activate a user', async () => {
      const activatedUser = { 
        id: '1', 
        email: 'user1@example.com', 
        fullname: 'User One', 
        role: 'Developer' as const, 
        namespaces: ['default'], 
        createdAt: '2024-01-01', 
        lastLogin: null,
        status: 'active' as const
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => activatedUser
      } as Response);

      const result = await UserService.activateUser("1");

      expect(mockFetch).toHaveBeenCalledWith('/api/users/1/activate', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      expect(result).toEqual(activatedUser);
    });

    it('should handle activation errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ message: 'User not found' })
      } as Response);

      await expect(UserService.activateUser("999")).rejects.toThrow('User not found');
    });
  });

  describe('deactivateUser', () => {
    it('should deactivate a user', async () => {
      const deactivatedUser = { 
        id: '1', 
        email: 'user1@example.com', 
        fullname: 'User One', 
        role: 'Developer' as const, 
        namespaces: ['default'], 
        createdAt: '2024-01-01', 
        lastLogin: null,
        status: 'inactive' as const
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => deactivatedUser
      } as Response);

      const result = await UserService.deactivateUser("1");

      expect(mockFetch).toHaveBeenCalledWith('/api/users/1/deactivate', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      expect(result).toEqual(deactivatedUser);
    });

    it('should handle deactivation errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ message: 'User not found' })
      } as Response);

      await expect(UserService.deactivateUser("999")).rejects.toThrow('User not found');
    });
  });

  describe('bulkUpdateUsers', () => {
    it('should bulk update users', async () => {
      const bulkUpdate = {
        userIds: ['1', '2'],
        updates: { role: 'SysAdmin' as const }
      };
      const result = { 
        successful: ['1', '2'], 
        failed: [] 
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => result
      } as Response);

      const response = await UserService.bulkUpdateUsers(bulkUpdate);

      expect(mockFetch).toHaveBeenCalledWith('/api/users/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bulkUpdate)
      });
      expect(response).toEqual(result);
    });

    it('should handle bulk update errors', async () => {
      const bulkUpdate = {
        userIds: ['1'],
        updates: { role: 'SysAdmin' as const }
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ message: 'Validation error' })
      } as Response);

      await expect(UserService.bulkUpdateUsers(bulkUpdate)).rejects.toThrow('Validation error');
    });
  });

  describe('getRoles', () => {
    it('should fetch available roles', async () => {
      const mockRoles = [
        { id: 'sysadmin', name: 'SysAdmin', description: 'System Administrator', permissions: ['*'] },
        { id: 'dev', name: 'Developer', description: 'Developer', permissions: ['read'] }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRoles
      } as Response);

      const result = await UserService.getRoles();

      expect(mockFetch).toHaveBeenCalledWith('/api/users/roles', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      expect(result).toEqual(mockRoles);
    });

    it('should handle roles fetch errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ message: 'Database error' })
      } as Response);

      await expect(UserService.getRoles()).rejects.toThrow('Database error');
    });
  });
});
