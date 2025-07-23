import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { FiEdit, FiTrash2, FiCheck, FiX, FiLoader, FiAlertCircle } from 'react-icons/fi';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

interface Category {
  id: string;
  ten: string;
  moTa?: string;
  macDinh?: boolean;
  status?: string;
}

const ManageCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('categories');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Category>>({});

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5118/api/admin/GetAllCategory`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to load categories');
        }
        
        const data = await res.json();
        const categories = data.data || [];
        setCategories(categories);
      } catch (err: any) {
        setError(err.message || 'An error occurred while loading categories');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setEditForm({
      ten: category.ten,
      moTa: category.moTa,
      status: category.status
    });
  };

  const handleUpdate = async (id: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5118/api/admin/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Update failed');
      }

      setCategories(categories.map(cat => 
        cat.id === id ? { ...cat, ...editForm } : cat
      ));
      setEditingId(null);
      setSuccessMessage('Cập nhật danh mục thành công');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Cập nhật danh mục thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5118/api/admin/${id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Delete failed');
      }

      setCategories(categories.filter(c => c.id !== id));
      setSuccessMessage('Xóa danh mục thành công');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Xóa danh mục thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5118/api/admin/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Approval failed');
      }

      setCategories(categories.map(cat => 
        cat.id === id ? { ...cat, status: 'Approved' } : cat
      ));
      setSuccessMessage('Duyệt danh mục thành công');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Duyệt danh mục thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5118/api/admin/${id}/reject`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Reject failed');
      }

      setCategories(categories.map(cat => 
        cat.id === id ? { ...cat, status: 'Rejected' } : cat
      ));
      setSuccessMessage('Từ chối danh mục thành công');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Từ chối danh mục thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 overflow-x-hidden">
        <main className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Quản lý danh mục</h1>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
              <FiAlertCircle className="mr-2" />
              {error}
              <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700">
                <FiX />
              </button>
            </div>
          )}
          
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center">
              <FiCheck className="mr-2" />
              {successMessage}
              <button onClick={() => setSuccessMessage('')} className="ml-auto text-green-500 hover:text-green-700">
                <FiX />
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <FiLoader className="animate-spin text-orange-500 text-4xl" />
            </div>
          ) : categories.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-8 text-center">
              <p className="text-gray-500 text-lg">Chưa có danh mục nào. Hãy thêm một danh mục mới.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tên danh mục
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mô tả
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categories.map(cat => (
                      <tr key={cat.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingId === cat.id ? (
                            <input
                              type="text"
                              value={editForm.ten || ''}
                              onChange={(e) => setEditForm({...editForm, ten: e.target.value})}
                              className="border rounded px-2 py-1 w-full"
                            />
                          ) : (
                            <div className="text-sm font-medium text-gray-900">{cat.ten}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingId === cat.id ? (
                            <input
                              type="text"
                              value={editForm.moTa || ''}
                              onChange={(e) => setEditForm({...editForm, moTa: e.target.value})}
                              className="border rounded px-2 py-1 w-full"
                            />
                          ) : (
                            <div className="text-sm text-gray-500">{cat.moTa || '-'}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingId === cat.id ? (
                            <select
                              value={editForm.status || 'Pending'}
                              onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                              className="border rounded px-2 py-1"
                            >
                              <option value="Pending">Chờ duyệt</option>
                              <option value="Approved">Đã duyệt</option>
                              <option value="Rejected">Từ chối</option>
                            </select>
                          ) : (
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${cat.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                                cat.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                                'bg-yellow-100 text-yellow-800'}`}>
                              {cat.status === 'Approved' ? 'Đã duyệt' : 
                               cat.status === 'Rejected' ? 'Từ chối' : 
                               'Chờ duyệt'}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {editingId === cat.id ? (
                            <>
                              <button
                                onClick={() => handleUpdate(cat.id)}
                                className="text-green-600 hover:text-green-900 mr-3"
                                disabled={loading}
                              >
                                <FiCheck className="inline" /> Lưu
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="text-gray-600 hover:text-gray-900"
                                disabled={loading}
                              >
                                <FiX className="inline" /> Hủy
                              </button>
                            </>
                          ) : (
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleEdit(cat)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Chỉnh sửa"
                              >
                                <FiEdit className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(cat.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Xóa"
                              >
                                <FiTrash2 className="h-5 w-5" />
                              </button>
                              {cat.status !== 'Approved' && (
                                <button
                                  onClick={() => handleApprove(cat.id)}
                                  className="text-green-600 hover:text-green-900"
                                  title="Duyệt"
                                >
                                  <FiCheck className="h-5 w-5" />
                                </button>
                              )}
                              {cat.status !== 'Rejected' && (
                                <button
                                  onClick={() => handleReject(cat.id)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Từ chối"
                                >
                                  <FiX className="h-5 w-5" />
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ManageCategories;