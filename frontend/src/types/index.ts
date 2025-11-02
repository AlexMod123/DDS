export interface Status { id: number; name: string; slug: string; is_active: boolean; }
export interface TransactionType { id: number; name: string; slug: string; is_income: boolean; is_active: boolean; }
export interface Category { id: number; name: string; parent: string | null; status: string; is_active: boolean; }
export interface Transaction {
    id: number;
    created_at: string;
    status: string;
    transaction_type: string;
    category: string;
    amount: string;
    comment: string;
}