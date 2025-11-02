// src/components/ReferenceManager.tsx
import { useState, useEffect } from 'react';
import api from '../api/api';
import { Plus, Edit, Trash2, ChevronRight } from 'lucide-react';
import Modal from './modal/Modal';
import { STATS_ROUTES } from '../const/const';

interface Status { id: number; name: string; slug: string; is_active: boolean; }
interface TransactionType { id: number; name: string; slug: string; is_income: boolean; is_active: boolean; }
interface Category { id: number; name: string; parent: string | null; status: string; is_active: boolean; }

export default function ReferenceManager() {
    const [statuses, setStatuses] = useState<Status[]>([]);
    const [types, setTypes] = useState<TransactionType[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeTab, setActiveTab] = useState<'statuses' | 'types' | 'categories'>('statuses');

    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const [s, t, c] = await Promise.all([
            api.get('/statuses/'),
            api.get('/types/'),
            api.get('/categories/'),
        ]);
        setStatuses(s.data);
        setTypes(t.data);
        setCategories(c.data);
    };

    const handleSave = async () => {
        const endpoint = activeTab === 'statuses' ? '/statuses/' :
            activeTab === 'types' ? '/types/' : '/categories/';

        if (editingItem) {
            await api.put(`${endpoint}${editingItem.id}/`, formData);
        } else {
            await api.post(endpoint, formData);
        }
        setModalOpen(false);
        setEditingItem(null);
        fetchData();
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Удалить?')) return;
        const endpoint = activeTab === 'statuses' ? '/statuses/' :
            activeTab === 'types' ? '/types/' : '/categories/';
        await api.delete(`${endpoint}${id}/`);
        fetchData();
    };

    const openModal = (item?: any) => {
        setEditingItem(item || null);
        setFormData(item || getDefaultForm());
        setModalOpen(true);
    };

    const getDefaultForm = () => {
        if (activeTab === 'statuses') return { name: '', slug: '', is_active: true };
        if (activeTab === 'types') return { name: '', slug: '', is_income: true, is_active: true };
        return { name: '', parent_id: '', status_id: statuses[0]?.id || '', is_active: true };
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Управление справочниками</h1>
            <div className="flex justify-between items-right mb-3">
                <a href={STATS_ROUTES}>Движение денежных средств</a>
            </div>
            {/* Вкладки */}
            <div className="flex gap-2 mb-6 border-b">
                {(['statuses', 'types', 'categories'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 font-medium transition-colors ${activeTab === tab
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        {tab === 'statuses' ? 'Статусы' :
                            tab === 'types' ? 'Типы операций' : 'Категории'}
                    </button>
                ))}
            </div>

            {/* Кнопка добавления */}
            <div className="mb-4">
                <button
                    onClick={() => openModal()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                >
                    <Plus size={18} /> Добавить
                </button>
            </div>

            {/* Таблица */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {activeTab === 'statuses' && (
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left">Название</th>
                                <th className="px-4 py-3 text-left">Slug</th>
                                <th className="px-4 py-3 text-center">Активен</th>
                                <th className="px-4 py-3 text-center">Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {statuses.map(s => (
                                <tr key={s.id} className="border-t hover:bg-gray-50">
                                    <td className="px-4 py-3">{s.name}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{s.slug}</td>
                                    <td className="px-4 py-3 text-center">
                                        {s.is_active ? 'Yes' : 'No'}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button onClick={() => openModal(s)} className="text-blue-600 mr-3">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(s.id)} className="text-red-600">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {activeTab === 'types' && (
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left">Название</th>
                                <th className="px-4 py-3 text-left">Slug</th>
                                <th className="px-4 py-3 text-center">Доход</th>
                                <th className="px-4 py-3 text-center">Активен</th>
                                <th className="px-4 py-3 text-center">Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {types.map(t => (
                                <tr key={t.id} className="border-t hover:bg-gray-50">
                                    <td className="px-4 py-3">{t.name}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{t.slug}</td>
                                    <td className="px-4 py-3 text-center">
                                        {t.is_income ? 'Yes' : 'No'}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {t.is_active ? 'Yes' : 'No'}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button onClick={() => openModal(t)} className="text-blue-600 mr-3">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(t.id)} className="text-red-600">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {activeTab === 'categories' && (
                    <div className="p-4">
                        {categories.filter(c => !c.parent).map(parent => (
                            <div key={parent.id} className="mb-4">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <ChevronRight size={18} className="text-gray-500" />
                                        <span className="font-medium">{parent.name}</span>
                                        <span className="text-sm text-gray-500">({parent.status})</span>
                                    </div>
                                    <div>
                                        <button onClick={() => openModal(parent)} className="text-blue-600 mr-3">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(parent.id)} className="text-red-600">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="ml-8 mt-2 space-y-2">
                                    {categories.filter(c => c.parent === parent.name).map(sub => (
                                        <div key={sub.id} className="flex items-center justify-between p-2 pl-6 bg-white border-l-4 border-gray-200">
                                            <span>{sub.name}</span>
                                            <div>
                                                <button onClick={() => openModal(sub)} className="text-blue-600 mr-3">
                                                    <Edit size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(sub.id)} className="text-red-600">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Модальное окно */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? 'Редактировать' : 'Добавить'}>
                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
                    {activeTab === 'statuses' && (
                        <>
                            <input
                                type="text"
                                placeholder="Название"
                                value={formData.name || ''}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full p-2 border rounded"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Slug"
                                value={formData.slug || ''}
                                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                className="w-full p-2 border rounded"
                            />
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active ?? true}
                                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                />
                                Активен
                            </label>
                        </>
                    )}

                    {activeTab === 'types' && (
                        <>
                            <input
                                type="text"
                                placeholder="Название"
                                value={formData.name || ''}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full p-2 border rounded"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Slug"
                                value={formData.slug || ''}
                                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                className="w-full p-2 border rounded"
                            />
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.is_income ?? true}
                                    onChange={e => setFormData({ ...formData, is_income: e.target.checked })}
                                />
                                Доход
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active ?? true}
                                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                />
                                Активен
                            </label>
                        </>
                    )}

                    {activeTab === 'categories' && (
                        <>
                            <input
                                type="text"
                                placeholder="Название"
                                value={formData.name || ''}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full p-2 border rounded"
                                required
                            />
                            <select
                                value={formData.parent_id || ''}
                                onChange={e => setFormData({ ...formData, parent_id: e.target.value ? Number(e.target.value) : null })}
                                className="w-full p-2 border rounded"
                            >
                                <option value="">— Нет родителя —</option>
                                {categories.filter(c => !c.parent).map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            <select
                                value={formData.status_id || ''}
                                onChange={e => setFormData({ ...formData, status_id: Number(e.target.value) })}
                                className="w-full p-2 border rounded"
                                required
                            >
                                <option value="">Выберите статус</option>
                                {statuses.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active ?? true}
                                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                />
                                Активен
                            </label>
                        </>
                    )}

                    <div className="flex gap-2">
                        <button type="submit" className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                            Сохранить
                        </button>
                        <button type="button" onClick={() => setModalOpen(false)} className="flex-1 bg-gray-300 p-2 rounded">
                            Отмена
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}