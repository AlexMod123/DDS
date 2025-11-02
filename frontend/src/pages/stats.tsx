import { useEffect, useState, useMemo } from "react";
import api from "../api/api";
import type { Transaction, Status, TransactionType, Category } from "../types";
import { Plus, Edit, Trash2, Search, Calendar,TimerResetIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import TransactionModal from "./modal/TransactionModal";
import { REFERENCE_ROUTES } from "../const/const";

export default function Stats() {
  const isAuth = true;
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [types, setTypes] = useState<TransactionType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    Promise.all([
      api.get("/transactions"),
      api.get("/statuses"),
      api.get("/types"),
      api.get("/categories"),
    ]).then(([t, s, ty, c]) => {
      setTransactions(t.data);
      setStatuses(s.data);
      setTypes(ty.data);
      setCategories(c.data);
    });
  }, []);

  useMemo(() => {
    let filtered = transactions;

    // Фильтр по поиску
    if (search) {
      filtered = filtered.filter(t =>
        t.category.toLowerCase().includes(search.toLowerCase()) ||
        (t.comment && t.comment.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Фильтр по дате
    if (dateFrom) {
      filtered = filtered.filter(t => t.created_at >= dateFrom);
    }
    if (dateTo) {
      filtered = filtered.filter(t => t.created_at <= dateTo);
    }

    setFilteredTransactions(filtered);
  }, [transactions, search, dateFrom, dateTo]);
  const handleSave = async (data: unknown) => {
    if (editing) {
      const res = await api.put(`/transactions/${editing.id}/`, data);
      setTransactions(
        transactions.map((t) => (t.id === editing.id ? res.data : t))
      );
    } else {
      const res = await api.post("/transactions/", data);
      setTransactions([res.data, ...transactions]);
    }
    setModalOpen(false);
    setEditing(null);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Удалить запись?")) {
      await api.delete(`/transactions/${id}/`);
      setTransactions(transactions.filter((t) => t.id !== id));
    }
  };
  const resetDateFilter = () => {
    setDateFrom('');
    setDateTo('');
  };
  return (
    <div className="min-h-screen bg-gray-50 p-1">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow p-3 mb-3">
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-2xl font-bold text-gray-800">
              Движение денежных средств
            </h1>

          </div>
          {isAuth ? <div className="flex justify-between items-right mb-3">
            <a href={REFERENCE_ROUTES}>Изменение справочников</a>
          </div> : <></> }
          <table>
            <tr>
              <th>
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Поиск"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg"
                  />
                </div>

              </th>
              {/*Фильтр по дате */}
              <th>
                <div className="relative mb-"> C </div>   
              </th>
              <th>

                {/* Дата от */}
                <div className="relative mb-6">
                  <Calendar className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="С даты"
                  />
                </div>
              </th>
              <th>
                <div className="relative mb-"> По </div>
              </th>
              <th>
                {/* Дата до */}
                <div className="relative mb-6">
                  <Calendar className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="date"
                    value={dateTo}
                    onChange={e => setDateTo(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="По дату"
                  />
                </div>
              </th>
              <th>

              </th>
              <th>
                <div className="relative mb-6">
                {(dateFrom || dateTo) && (
                  <button
                    onClick={resetDateFilter}
                      className="bg-blue-600 text-white px-2 py-1 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                    title="Сбросить фильтр"
                  >
                    <TimerResetIcon size={16} />
                  </button>
                )}
                </div>
              </th>
            </tr>
          </table>

          {/* Информация о фильтре */}
          {(search || dateFrom || dateTo) && (
            <div className="text-sm text-gray-600 mb-6">
              Найдено: <strong>{filteredTransactions.length}</strong> из <strong>{transactions.length}</strong> записей
              {dateFrom && dateTo && ` (с ${format(parseISO(dateFrom), 'dd.MM.yyyy')} по ${format(parseISO(dateTo), 'dd.MM.yyyy')})`}
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-center">Статус</th>
                  <th className="px-4 py-3 text-center">Тип</th>
                  <th className="px-4 py-3 text-center">Категория</th>
                  <th className="px-4 py-3 text-center">Сумма</th>
                  <th className="px-4 py-3 text-center">Комментарий</th>
                  <th className="px-4 py-3 text-center">Дата</th>
                  <th>
                    <div className="mb-6">
                      <button
                        style={{ borderRadius: 22, textAlign: "center" }}
                        onClick={() => {
                          setEditing(null);
                          setModalOpen(true);
                        }}
                        className="bg-blue-600 text-white px-2 py-1 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map(t => (
                  <tr key={t.id} className="border-t hover:bg-gray-50">
                    
                    <td className="px-3 py-2">{t.status}</td>
                    <td className="px-3 py-2">
                      <span className={t.transaction_type === 'Пополнение' ? 'text-green-600' : 'text-red-600'}>
                        {t.transaction_type}
                      </span>
                    </td>
                    <td className="px-3 py-2">{t.category}</td>
                    <td className={`px-3 py-2 text-right font-medium ${t.transaction_type === 'Пополнение' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.transaction_type === 'Пополнение' ? '+' : '-'}₽{t.amount}
                    </td>
                    <td className="px-3 py-2 text-gray-600">{t.comment || '—'}</td>
                    <td className="px-3 py-2">{format(parseISO(t.created_at), 'dd.MM.yyyy')}</td>
                    <td className="px-1 py-2 text-center">
                      <button onClick={() => { setEditing(t); setModalOpen(true); }} className="bg-blue-600 text-white px-2 py-1 rounded-lg flex items-center gap-2 hover:bg-blue-700">
                        <Edit size={16} />
                      </button>
                    </td>
                    <td className="px-1 py-2 text-center">
                      <button onClick={() => handleDelete(t.id)} className="bg-blue-600 text-white px-2 py-1 rounded-lg flex items-center gap-2 hover:bg-blue-700">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredTransactions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Нет записей по заданным фильтрам
              </div>
            )}
          </div>
        </div>
      </div>

      <TransactionModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
        transaction={editing}
        statuses={statuses}
        types={types}
        categories={categories}
      />
    </div>
  );
}

