// src/components/CategoryTreeDropdown.tsx
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface Category {
    id: number;
    name: string;
    parent: string | null;
    status: string;
}

interface CategoryNode {
    id: number;
    name: string;
    children: CategoryNode[];
}

interface Props {
    categories: Category[];
    selectedId: number | null;
    onSelect: (id: number) => void;
    placeholder?: string;
}

export default function CategoryTreeDropdown({
    categories,
    selectedId,
    onSelect,
    placeholder = "Выберите подкатегорию"
}: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [expanded, setExpanded] = useState<Set<number>>(new Set());
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Строим дерево
    const tree = buildTree(categories);

    function buildTree(cats: Category[]): CategoryNode[] {
        const map = new Map<number, CategoryNode>();
        const roots: CategoryNode[] = [];

        cats.forEach(cat => {
            const node: CategoryNode = {
                id: cat.id,
                name: cat.name,
                children: []
            };
            map.set(cat.id, node);

            if (!cat.parent) {
                roots.push(node);
            } else {
                const parentCat = cats.find(p => p.name === cat.parent);
                if (parentCat) {
                    const parentNode = map.get(parentCat.id);
                    if (parentNode) parentNode.children.push(node);
                }
            }
        });

        return roots;
    }

    const toggleExpand = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpanded(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleSelect = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect(id);
        setIsOpen(false);
    };

    // Закрытие при клике вне
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Найти выбранную подкатегорию
    const selectedCategory = selectedId
        ? categories.find(c => c.id === selectedId)
        : null;

    const selectedParent = selectedCategory
        ? categories.find(c => c.name === selectedCategory.parent)
        : null;

    const displayText = selectedCategory
        ? `${selectedParent?.name || ''} → ${selectedCategory.name}`
        : placeholder;

    const renderNode = (node: CategoryNode, depth = 0) => {
        const hasChildren = node.children.length > 0;
        const isExpanded = expanded.has(node.id);
        const isSelected = selectedId === node.id;

        return (
            <div key={node.id}>
                <div
                    onClick={(e) => hasChildren ? toggleExpand(node.id, e) : handleSelect(node.id, e)}
                    className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-blue-50 ${isSelected ? 'bg-blue-100 font-medium' : ''
                        }`}
                    style={{ paddingLeft: `${depth * 16 + 12}px` }}
                >
                    {hasChildren ? (
                        <span className="text-gray-500">
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </span>
                    ) : (
                        <span className="w-4" />
                    )}
                    <span className="flex-1 text-sm">{node.name}</span>
                </div>
                {hasChildren && isExpanded && (
                    <div>
                        {node.children.map(child => renderNode(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full p-1 border rounded-lg text-left flex items-center justify-between transition-all ${isOpen ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-300'
                    } ${selectedId ? 'text-gray-300' : 'text-gray-300'}`}
            >
                <span className="truncate">{displayText}</span>
                <ChevronDown size={18} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                    {tree.length === 0 ? (
                        <div className="p-1 text-center text-gray-500 text-sm">Нет категорий</div>
                    ) : (
                        tree.map(renderNode)
                    )}
                </div>
            )}
        </div>
    );
}