import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MaintainUser.css';

const MaintainUser = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/admin/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusToggle = async (userId, currentStatus) => {
        try {
            await axios.put(`/api/admin/users/${userId}/status`, {
                isActive: !currentStatus
            });
            fetchUsers();
        } catch (error) {
            alert('Failed to update user status');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await axios.delete(`/api/admin/users/${userId}`);
                fetchUsers();
            } catch (error) {
                alert('Failed to delete user');
            }
        }
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
    };

    const handleSaveEdit = async () => {
        try {
            await axios.put(`/api/admin/users/${editingUser._id}`, editingUser);
            setEditingUser(null);
            fetchUsers();
        } catch (error) {
            alert('Failed to update user');
        }
    };

    const filteredUsers = users.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="loading">Loading users...</div>;

    return (
        <div className="maintain-container">
            <h1>Manage Users</h1>
            
            <div className="controls">
                <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Joined</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.map(user => (
                        <tr key={user._id}>
                            {editingUser?._id === user._id ? (
                                <>
                                    <td>
                                        <input
                                            type="text"
                                            value={editingUser.name}
                                            onChange={(e) => setEditingUser({
                                                ...editingUser,
                                                name: e.target.value
                                            })}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="email"
                                            value={editingUser.email}
                                            onChange={(e) => setEditingUser({
                                                ...editingUser,
                                                email: e.target.value
                                            })}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={editingUser.phone || ''}
                                            onChange={(e) => setEditingUser({
                                                ...editingUser,
                                                phone: e.target.value
                                            })}
                                        />
                                    </td>
                                    <td>
                                        <select
                                            value={editingUser.role}
                                            onChange={(e) => setEditingUser({
                                                ...editingUser,
                                                role: e.target.value
                                            })}
                                        >
                                            <option value="customer">Customer</option>
                                            <option value="vendor">Vendor</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    <td>
                                        <button 
                                            onClick={() => handleStatusToggle(user._id, user.isActive)}
                                            className={`status-btn ${user.isActive ? 'active' : 'inactive'}`}
                                        >
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <button onClick={handleSaveEdit} className="save-btn">Save</button>
                                        <button onClick={() => setEditingUser(null)} className="cancel-btn">Cancel</button>
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.phone || '-'}</td>
                                    <td>
                                        <span className={`role-badge role-${user.role}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <button onClick={() => handleEditUser(user)} className="edit-btn">Edit</button>
                                        <button onClick={() => handleDeleteUser(user._id)} className="delete-btn">Delete</button>
                                        <button 
                                            onClick={() => handleStatusToggle(user._id, user.isActive)}
                                            className="toggle-btn"
                                        >
                                            {user.isActive ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MaintainUser;