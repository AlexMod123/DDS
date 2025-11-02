import { useForm, Controller } from "react-hook-form";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Category, Status, Transaction, TransactionType } from "../../types";
import CategoryTreeDropdown from '../../components/CategorySelect';
import { SaveIcon, FileXIcon } from "lucide-react";

const schema = z.object({
  created_at: z.string(),
  status_id: z.number(),
  transaction_type_id: z.number(),
  category_id: z.number(),
  amount: z.string().min(1),
  comment: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FormData) => void;
  transaction: Transaction | null;
  statuses: Status[];
  types: TransactionType[];
  categories: Category[];
}

export default function TransactionModal({
  isOpen,
  onClose,
  onSave,
  transaction,
  statuses,
  types,
  categories,
}: Props) {
  if (!isOpen) return null;

  const isEdit = !!transaction;
  // Подготовка defaultValues
  const defaultValues = isEdit
    ? {
      created_at: transaction.created_at,
      status_id: statuses.find(s => s.name === transaction.status)?.id || 0,
      transaction_type_id: types.find(t => t.name === transaction.transaction_type)?.id || 0,
      category_id: categories.find(c => c.name === transaction.category)?.id || 0,
      amount: transaction.amount,
      comment: transaction.comment || '',
    }
    : {
      created_at: new Date().toISOString().split('T')[0],
      status_id: 0,
      transaction_type_id: 0,
      category_id: 0,
      amount: '',
      comment: '',
    };

  const { register, handleSubmit, setValue, watch, control, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const selectedCategoryId = watch('category_id');

  // Сброс и установка значений
  useEffect(() => {
    if (!isOpen) return;

    if (isEdit && transaction) {
      const statusId = statuses.find(s => s.name === transaction.status)?.id || 0;
      const typeId = types.find(t => t.name === transaction.transaction_type)?.id || 0;
      const catId = categories.find(c => c.name === transaction.category)?.id || 0;

      reset({
        created_at: transaction.created_at,
        status_id: statusId,
        transaction_type_id: typeId,
        category_id: catId,
        amount: transaction.amount,
        comment: transaction.comment || '',
      });
    } else {
      reset({
        created_at: new Date().toISOString().split('T')[0],
        status_id: 0,
        transaction_type_id: 0,
        category_id: 0,
        amount: '',
        comment: '',
      });
    }
  }, [transaction, statuses, types, categories, reset, isEdit]);
const onCloseClick = () => {
  reset();
  onClose();
}
  const onSubmit = (data: FormData) => {
    onSave(data);
    reset();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h5 className="text-xl font-bold items-left mb-4"
            style={{ textAlign: "left" }}
          >
            {transaction ? "Редактировать" : "Новая запись"}
          </h5>

        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <table>
            <tr>
              <th>
                {/* <select
                  {...register("status_id", { valueAsNumber: true })}
                  className="w-full p-1 border rounded"
                >
                  <option value="">Статус</option>
                  {statuses.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select> */}
                <div>
                  <Controller
                    name="status_id"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        value={field.value}
                        className="w-full p-1 border rounded-lg"
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      >
                        <option value="">Выберите статус</option>
                        {statuses.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    )}
                  />
                </div>
              </th>
              <th>
                <select
                  {...register("transaction_type_id", { valueAsNumber: true })}
                  className="w-full p-1 border rounded"
                >
                  <option value="">Тип</option>
                  {types.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </th>
              <th>
                <div>
                  <CategoryTreeDropdown
                    categories={categories}
                    selectedId={selectedCategoryId || null}
                    onSelect={(id) => setValue('category_id', id)}
                    placeholder="Выберите подкатегорию..."
                  />
                  <input type="hidden" {...register('category_id', { valueAsNumber: true })} />
                  {errors.category_id && <p className="text-red-500 text-sm mt-1">Выберите подкатегорию</p>}
                </div>
              </th>
              <th>
                <input
                  type="number"
                  step="0.01"
                  {...register("amount")}
                  placeholder="Сумма"
                  className="w-full p-1 border rounded"
                />
              </th>
              <th>
                <input
                  type="date"
                  {...register("created_at")}
                  className="w-full p-1 border rounded"
                />
              </th>
              <th>
                <input
                  {...register("comment")}
                  placeholder="Комментарий"
                  className="w-full p-1 border rounded"
                />
              </th>
              <th>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white p-1 rounded"
                  >
                    <SaveIcon size={16} />
                  </button>
                </div>
              </th>
              <th>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { onCloseClick(); }}
                    className="flex-1 bg-gray-300 p-1 rounded"
                  >
                    <FileXIcon size={16} />
                  </button>
                </div>
              </th>
            </tr>
          </table>
        </form>
      </div>
    </div>
  );
}
